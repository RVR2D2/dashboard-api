import express, {
  Express
} from 'express'
import {
  Server
} from 'http'
import {
  UserController
} from './users/users.controller'
import {
  ExeptionFilter
} from "./errors/exeption.filter";
import {
  ILogger
} from "./logger/logger.interface";
import {
  inject,
  injectable
} from "inversify";
import 'reflect-metadata'
import {
  TYPES
} from "./types";

@injectable()
export class App {
  app: Express
  port: number
  server: Server

  constructor(
    @inject(TYPES.ILogger) private logger: ILogger,
    @inject(TYPES.UserController) private userController: UserController,
    @inject(TYPES.ExeptionFilter) private exeptionFilter: ExeptionFilter
  ) {
    this.app = express()
    this.port = 8000
  }

  useRoutes() {
    this.app.use('/users', this.userController.router)
  }

  useExeptionFilters() {
    this.app.use(this.exeptionFilter.catch.bind(this))
  }

  public async init() {
    this.useRoutes()
    this.useExeptionFilters()
    this.server = this.app.listen(this.port)
    this.logger.log(`Сервер запущен на http://localhost:${this.port}`)
  }
}
