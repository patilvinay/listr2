import Enquirer from 'enquirer'

import { PromptError } from '@interfaces/listr.interface'

export type PromptOptions =
  | ArrayPromptOptions
  | BooleanPromptOptions
  | StringPromptOptions
  | NumberPromptOptions
  | SnippetPromptOptions
  | SortPromptOptions
  | BasePromptOptions

interface BasePromptOptions {
  name?: string | (() => string)
  message: string | (() => string) | (() => Promise<string>)
  initial?: boolean | number | string | (() => string) | (() => Promise<string>)
  required?: boolean
  skip?: ((state: object) => boolean | Promise<boolean>) | boolean
  stdin?: NodeJS.ReadStream
  stdout?: NodeJS.WriteStream
  format?(value: any): any | Promise<any>
  result?(value: any): any | Promise<any>
  validate?(value: any): boolean | Promise<boolean> | string | Promise<string>
  onSubmit?(name: any, value: any, prompt: Enquirer.Prompt): boolean | Promise<boolean>
  onCancel?(name: any, value: any, prompt: Enquirer.Prompt): boolean | Promise<boolean>
}

interface ArrayPromptOptions extends BasePromptOptions {
  choices: string[] | BasePromptOptions[]
  maxChoices?: number
  muliple?: boolean
  initial?: number
  delay?: number
  separator?: boolean
  sort?: boolean
  linebreak?: boolean
  edgeLength?: number
  align?: 'left' | 'right'
  scroll?: boolean
}

interface BooleanPromptOptions extends BasePromptOptions {
  initial?: boolean | (() => string) | (() => Promise<string>)
}

interface StringPromptOptions extends BasePromptOptions {
  initial?: string
  multiline?: boolean
}

interface NumberPromptOptions extends BasePromptOptions {
  min?: number
  max?: number
  delay?: number
  float?: boolean
  round?: boolean
  major?: number
  minor?: number
  initial?: number
}

interface SnippetPromptOptions extends BasePromptOptions {
  newline?: string
  fields: Partial<BasePromptOptions>[]
  template: string
}

interface SortPromptOptions extends BasePromptOptions {
  hint?: string
  drag?: boolean
  numbered?: boolean
}

interface QuizPromptOptions extends ArrayPromptOptions {
  correctChoice: number
}

interface TogglePromptOptions extends BasePromptOptions {
  enabled?: string
  disabled?: string
}

export type PromptTypes =
| 'AutoComplete'
| 'BasicAuth'
| 'Confirm'
| 'Editable'
| 'Form'
| 'Input'
| 'Invisible'
| 'List'
| 'MultiSelect'
| 'Numeral'
| 'Password'
| 'Quiz'
| 'Scale'
| 'Select'
| 'Snippet'
| 'Sort'
| 'Survey'
| 'Text'
| 'Toggle'

export type PromptOptionsType<T> =
  T extends 'AutoComplete' ? ArrayPromptOptions :
    T extends 'BasicAuth' ? StringPromptOptions :
      T extends 'Confirm' ? BooleanPromptOptions :
        T extends 'Editable' ? ArrayPromptOptions :
          T extends 'Form' ? ArrayPromptOptions :
            T extends 'Input' ? StringPromptOptions :
              T extends 'Invisible' ? StringPromptOptions :
                T extends 'List' ? ArrayPromptOptions :
                  T extends 'MultiSelect' ? ArrayPromptOptions :
                    T extends 'Numeral' ? NumberPromptOptions :
                      T extends 'Password' ? StringPromptOptions :
                        T extends 'Quiz' ? QuizPromptOptions :
                          T extends 'Scale' ? ArrayPromptOptions :
                            T extends 'Select' ? ArrayPromptOptions :
                              T extends 'Snippet' ? SnippetPromptOptions :
                                T extends 'Sort' ? SortPromptOptions:
                                  T extends 'Survey' ? ArrayPromptOptions :
                                    T extends 'Text' ? StringPromptOptions:
                                      T extends 'Toggle'? TogglePromptOptions :
                                        any

export interface PromptSettings {
  error?: boolean
  cancelCallback?: (settings?: PromptSettings) => string | Error | PromptError | void
}