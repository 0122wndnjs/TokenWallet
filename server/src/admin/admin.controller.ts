// TokenWallet/server/src/admin/admin.controller.ts
import {
  Controller,
  Get,
  UseGuards,
  Param,
  Patch,
  Body,
  HttpStatus,
  HttpCode,
  Query,
  Res,
  NotFoundException,
  ValidationPipe, 
  ParseUUIDPipe, 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { Response } from 'express';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UpdateUserDto } from '../user/dto/update-user.dto';

export class UpdateUserRoleDto {
  @IsEnum(UserRole, { message: '유효한 역할(user 또는 admin)을 입력해주세요.' })
  @IsNotEmpty({ message: '새로운 역할은 필수입니다.' })
  role: UserRole;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly userService: UserService) {}

  @Get('users')
  @HttpCode(HttpStatus.OK)
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('searchQuery') searchQuery: string = '',
    @Query('searchField') searchField: string = 'username',
    @Res() res: Response,
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const validSearchFields = ['username', 'name', 'email', 'phoneNumber', 'walletAddress', 'role'];
    if (searchField && !validSearchFields.includes(searchField)) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid search field provided.' });
    }

    try {
      const result = await this.userService.findAllPaginatedAndFiltered(
        pageNum,
        limitNum,
        searchQuery,
        searchField,
      );
      res.status(HttpStatus.OK).json({ data: result.users, total: result.total });
    } catch (error) {
      console.error('Error fetching admin users:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch users.' });
    }
  }

  // ✨ 추가: 특정 사용자 상세 정보 조회 엔드포인트
  // 이 엔드포인트는 getUserInfoWithWallet을 호출하여 지갑 잔액 정보도 함께 가져옵니다.
  @Get('users/:id')
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    // userService.getUserInfoWithWallet은 user가 없을 경우 NotFoundException을 던짐
    const user = await this.userService.getUserInfoWithWallet(id);
    return user;
  }

  // ✨ 추가: 사용자 정보 업데이트 엔드포인트
  @Patch('users/:id')
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateData: UpdateUserDto, // UpdateUserDto를 사용
  ) {
    const updatedUser = await this.userService.updateUser(id, updateData);
    // 민감 정보 제외하고 반환 (예: password, encryptedPrivateKey)
    const { password, encryptedPrivateKey, ...result } = updatedUser;
    return {
      statusCode: HttpStatus.OK,
      message: '사용자 정보가 성공적으로 업데이트되었습니다.',
      user: result,
    };
  }

  @Patch('users/:id/role') // 기존의 역할 변경 엔드포인트는 그대로 유지 (id로 통일)
  @HttpCode(HttpStatus.OK)
  async updateUserRole(
    @Param('id', ParseUUIDPipe) id: string, // ✨ userId 대신 id로 파라미터 명칭 통일, ParseUUIDPipe 적용
    @Body(ValidationPipe) updateUserRoleDto: UpdateUserRoleDto, // ✨ ValidationPipe 적용
  ) {
    const updatedUser = await this.userService.updateUserRole(id, updateUserRoleDto.role);
    const { password, encryptedPrivateKey, ...result } = updatedUser;
    return {
      statusCode: HttpStatus.OK,
      message: '사용자 역할이 성공적으로 업데이트되었습니다.',
      user: result,
    };
  }
}