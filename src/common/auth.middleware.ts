import { IMiddlewares } from './middleware.interface';
import { NextFunction, Request, Response } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';

export class AuthMiddleware implements IMiddlewares {
	constructor(private secret: string) {}

	execute(req: Request, res: Response, next: NextFunction): void {
		if (req.headers.authorization) {
			verify(
				req.headers.authorization.split(' ')[1],
				this.secret,
				(err, payload: JwtPayload | any) => {
					if (err) {
						next();
					} else if (payload) {
						req.user = payload.email;
						next();
					}
				},
			);
		} else {
			next();
		}
	}
}
