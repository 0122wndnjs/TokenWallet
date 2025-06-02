// server/src/admin/admin.controller.ts
import { Controller, Get, UseGuards, Param, Patch, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';

// ✨ DTO 생성 (역할 변경을 위한)
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserRoleDto {
  @IsEnum(UserRole, { message: '유효한 역할(user 또는 admin)을 입력해주세요.' })
  @IsNotEmpty({ message: '새로운 역할은 필수입니다.' })
  role: UserRole;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard) // JWT 인증 및 역할 기반 접근 제어
@Roles(UserRole.ADMIN) // 이 컨트롤러의 모든 엔드포인트는 ADMIN 역할만 접근 가능
export class AdminController {
  constructor(private readonly userService: UserService) {}

  @Get('users')
  @HttpCode(HttpStatus.OK)
  async getAllUsers() {
    // 비밀번호와 개인 키가 제외된 모든 사용자 목록 반환
    return this.userService.findAllUsers();
  }

  @Patch('users/:id/role')
  @HttpCode(HttpStatus.OK)
  async updateUserRole(@Param('id') userId: string, @Body() updateUserRoleDto: UpdateUserRoleDto) {
    const updatedUser = await this.userService.updateUserRole(userId, updateUserRoleDto.role);
    // 민감 정보 제외하고 반환
    const { password, encryptedPrivateKey, ...result } = updatedUser;
    return {
      statusCode: HttpStatus.OK,
      message: '사용자 역할이 성공적으로 업데이트되었습니다.',
      user: result,
    };
  }

  // ✨ 기타 어드민 전용 엔드포인트 추가 가능 (예: 특정 사용자 지갑 조회, 트랜잭션 수동 확인 등)
}