import { ListrContext, ListrTask, ListrOptions } from '@interfaces/listr.interface'
import { Listr } from '@root/index'

export declare class ManagerClass <InjectCtx = ListrContext> {
  public options: ListrOptions<InjectCtx>
  constructor(options?: ListrOptions<InjectCtx>)
  add<Ctx = ListrContext> (tasks: ListrTask<Ctx>[] | ((ctx?: Ctx) => ListrTask<Ctx>[]), options?: ListrOptions<Ctx>): void
  runAll<Ctx = InjectCtx>(options?: ListrOptions<Ctx>): Promise<Ctx>
  run<Ctx = InjectCtx>(tasks: ListrTask<Ctx>[], options?: ListrOptions<Ctx>): Promise<Ctx>
  newListr<Ctx = InjectCtx> (tasks: ListrTask<Ctx>[], options?: ListrOptions<Ctx>): Listr<Ctx>
  indent <Ctx = ListrContext> (tasks: ListrTask<Ctx>[] | ((ctx?: Ctx) => ListrTask<Ctx>[]), options?: ListrOptions<Ctx>, taskOptions?: Omit<ListrTask, 'task'>): ListrTask<Ctx>
  getRunTime (pipetime: number): string
}
