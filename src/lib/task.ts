import sttoob from '@samverschueren/stream-to-observable'
import { Observable, Subject } from 'rxjs'
import { Stream } from 'stream'
import { v4 as uuidv4 } from 'uuid'

import { stateConstants } from '@constants/state.constants'
import { ListrContext, ListrError, ListrEvent, ListrOptions, ListrTask, ListrTaskObject, ListrTaskWrapper, PromptError, StateConstants } from '@interfaces/listr.interface'
import { Listr } from '@root/index'
import { getRenderer } from '@utils/renderer'

export class Task<Ctx> extends Subject<ListrEvent> implements ListrTaskObject<ListrContext> {
  public id: ListrTaskObject<Ctx>['id']
  public title: ListrTaskObject<Ctx>['title']
  public task: ListrTaskObject<Ctx>['task']
  public skip: ListrTaskObject<Ctx>['skip']
  public subtasks: ListrTaskObject<Ctx>['subtasks']
  public state: ListrTaskObject<Ctx>['state']
  public output: ListrTaskObject<Ctx>['output']
  public prompt: boolean | PromptError
  public options: ListrTaskObject<Ctx>['options']
  public exitOnError: boolean
  private enabled: boolean
  private enabledFn: ListrTask['enabled']

  constructor (public listr: Listr<Ctx>, public tasks: ListrTask, public injectedOptions: ListrOptions) {

    super()

    // move to private parameters
    this.id = uuidv4()
    this.title = this.tasks?.title
    this.task = this.tasks.task
    this.options = Object.assign({ persistentOutput: this.tasks?.persistentOutput, bottomBar: this.tasks?.bottomBar }, this.injectedOptions)
    // parse functions
    this.skip = this.tasks?.skip || ((): boolean => false)
    // parse functions
    this.skip = this.tasks?.skip || ((): boolean => false)
    this.enabledFn = this.tasks?.enabled || ((): boolean => true)
  }

  set state$ (state: StateConstants) {
    this.state = state

    this.next({
      type: 'STATE',
      data: state
    })
  }

  async check (ctx: Ctx): Promise<void> {
    // Check if a task is enabled or disabled
    if (this.state === undefined) {

      if (typeof this.enabledFn === 'function') {
        this.enabled = await this.enabledFn(ctx)
      } else {
        this.enabled = this.enabledFn
      }

      this.next({
        type: 'ENABLED',
        data: this.enabled
      })
    }
  }

  hasSubtasks (): boolean {
    return this.subtasks?.length > 0
  }

  isPending (): boolean {
    return this.state === stateConstants.PENDING
  }

  isSkipped (): boolean {
    return this.state === stateConstants.SKIPPED
  }

  isCompleted (): boolean {
    return this.state === stateConstants.COMPLETED
  }

  hasFailed (): boolean {
    return this.state === stateConstants.FAILED
  }

  isEnabled (): boolean {
    return this.enabled
  }

  isBottomBar (): boolean {
    if (typeof this?.options.bottomBar === 'number' || typeof this.options.bottomBar === 'boolean') {
      return true
    }
  }

  haspersistentOutput (): boolean {
    if (this.options.persistentOutput === true) {
      return true
    }
  }

  hasTitle (): boolean {
    return typeof this?.title === 'string'
  }

  isPrompt (): boolean {
    if (this.prompt) {
      return true
    } else {
      return false
    }
  }

  async run (context: Ctx, wrapper: ListrTaskWrapper<Ctx>): Promise<void> {
    const handleResult = (result): Promise<any> => {
      if (result instanceof Listr) {
        // Detect the subtask
        // assign options
        result.options = Object.assign(this.options, result.options)

        // switch to silent renderer since already rendering
        result.rendererClass = getRenderer('silent')

        // assign subtasks
        this.subtasks = result.tasks

        this.next({ type: 'SUBTASK' })

        result = result.run(context)

      // eslint-disable-next-line no-empty
      } else if (this.isPrompt()) {
        // do nothing, it is already being handled

      } else if (result instanceof Promise) {
        // Detect promise
        result = result.then(handleResult)

      } else if (result instanceof Stream.Readable) {
        // Detect stream
        result = sttoob(result)

      } else if (result instanceof Observable) {
        // Detect Observable
        result = new Promise((resolve, reject) => {
          result.subscribe({
            next: (data) => {
              this.output = data

              this.next({
                type: 'DATA',
                data
              })
            },
            error: reject,
            complete: resolve
          })
        })
      }

      return result
    }

    // finish the task first
    // Promise.resolve()
    this.state$ = stateConstants.PENDING

    // check if this function wants to be skipped
    const skipped = this.skip(context)
    if (skipped) {
      if (typeof skipped === 'string') {
        this.output = skipped
      } else if (this.hasTitle()) {
        this.output = this.title
      }
      this.state$ = stateConstants.SKIPPED
      return
    }

    try {
      // handle the results
      await handleResult(this.task(context, wrapper))

      if (this.isPending()) {
        this.state$ = stateConstants.COMPLETED
      }

    } catch (error) {

      // mark task as failed
      this.state$ = stateConstants.FAILED

      // catch prompt error, this was the best i could do without going crazy
      if (this.prompt instanceof PromptError) {
        // eslint-disable-next-line no-ex-assign
        error = new Error('Cancelled the prompt.')
      }

      // report error
      if (error instanceof ListrError) {
        wrapper.report(error)
        return
      }

      if (!this.hasSubtasks()) {
        // Do not show the message if we have subtasks as the error is already shown in the subtask
        this.title = error.message
      }

      wrapper.report(error)

      if (this.listr.options.exitOnError !== false) {
        // Do not exit when explicitely set to `false`
        throw error
      }
    } finally {
      // Mark the observable as completed
      this.complete()
    }
  }
}
