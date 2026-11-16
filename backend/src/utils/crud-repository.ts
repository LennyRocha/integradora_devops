import { AccessTokenClaims } from 'src/auth/interfaces/access-token-claims';
import { PaginationDto } from './pagination.dto';

export default interface ICrudRepository {
  findAllPaginated?(
    dto: PaginationDto,
    query?: string,
    params?: object,
  ): Promise<any>;
  findAll(query?: string): Promise<any>;
  findOne(id: string): Promise<any>;
  insert(
    payload: unknown,
    user: AccessTokenClaims,
    ip?: string,
    ...args: any[]
  ): Promise<any>;
  update(
    id: string,
    payload: unknown,
    user: AccessTokenClaims,
    ip?: string,
    ...args: unknown[]
  ): Promise<any>;
  toggleStatus(id: string, user: AccessTokenClaims, ip?: string): Promise<any>;
  delete?(id: string, user: AccessTokenClaims, ip?: string): Promise<any>;
}
