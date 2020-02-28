import { ListrContext, ListrRendererClass, ListrRendererValue } from '../interfaces/listr-task.interface'
import { MultiLineRenderer } from '../renderer/default.renderer'
import { SilentRenderer } from '../renderer/silent.renderer'

const renderers = {
  default: MultiLineRenderer,
  verbose: SilentRenderer,
  silent: SilentRenderer
}

function isRendererSupported (renderer: ListrRendererClass<ListrContext>): boolean {
  return  process.stdout.isTTY === true || renderer.nonTTY === true
}

function getRendererClass (renderer: ListrRendererValue<ListrContext>): ListrRendererClass<ListrContext> {
  if (typeof renderer === 'string') {
    return renderers[renderer] || renderers.default
  }

  return typeof renderer === 'function' ? renderer : renderers.default
}

export function getRenderer (renderer: ListrRendererValue<ListrContext>, fallbackRenderer?: ListrRendererValue<ListrContext>): ListrRendererClass<ListrContext> {
  let ret = getRendererClass(renderer)

  if (!isRendererSupported(ret)) {
    ret = getRendererClass(fallbackRenderer)
  }

  return ret
}
