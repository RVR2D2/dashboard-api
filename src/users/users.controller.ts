import { NextFunction, Request, Response } from 'express';
import { BaseController } from '../common/base.controller';
import { HttpError } from '../errors/http-error';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { ILogger } from '../logger/logger.interface';
import 'reflect-metadata';
import { IUserController } from './users.controller.interface';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { ValidateMiddleware } from '../common/validate.middleware';
import { sign } from 'jsonwebtoken';
import { IConfigService } from '../config/config.service.interface';
import { IUsersService } from './users.service.interface';

@injectable()
export class UserController extends BaseController implements IUserController {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.UserService) private usersService: IUsersService,
		@inject(TYPES.ConfigService) private configService: IConfigService,
	) {
		super(loggerService);
		this.bindRoutes([
			{
				path: '/register',
				method: 'post',
				func: this.register,
				middlewares: [new ValidateMiddleware(UserRegisterDto)],
			},
			{
				path: '/login',
				method: 'post',
				func: this.login,
				middlewares: [new ValidateMiddleware(UserLoginDto)],
			},
			{
				path: '/info',
				method: 'get',
				func: this.info,
				middlewares: [],
			},
		]);
	}

	async login(
		req: Request<{}, {}, UserLoginDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.usersService.validateUser(req.body);
		if (!result) {
			return next(new HttpError(401, 'Ошибка авторизации', 'login'));
		}
		const jwt = await this.singJWT(req.body.email, this.configService.get('SECRET'));

		this.ok(res, { jwt });
	}

	async register(
		{ body }: Request<{}, {}, UserRegisterDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.usersService.createUser(body);

		if (!result) {
			return next(new HttpError(422, 'Такой пользователь уже существует '));
		}

		this.ok(res, { email: result.email, id: result.id });
	}

	async info({ user }: Request, res: Response, next: NextFunction): Promise<void> {
		this.ok(res, { email: user });
	}

	private singJWT(email: string, secret: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			sign(
				{
					email,
					iat: Math.floor(Date.now() / 1000),
				},
				secret,
				{
					algorithm: 'HS256',
				},
				(err, token) => {
					if (err) reject(err);
					resolve(token as string);
				},
			);
		});
	}
}
