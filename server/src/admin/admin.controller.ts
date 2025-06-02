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
  Query, // ✨ Query 데코레이터 임포트
  Res // ✨ Res 데코레이터 임포트
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { Response } from 'express'; // ✨ Express Response 타입 임포트

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

  @Get('users') // GET /admin/users 엔드포인트
  @HttpCode(HttpStatus.OK)
  async getAllUsers(
    @Query('page') page: string = '1', // ✨ 페이지 번호 (기본값 1)
    @Query('limit') limit: string = '20', // ✨ 페이지당 항목 수 (기본값 20)
    @Query('searchQuery') searchQuery: string = '', // ✨ 검색어 (기본값 빈 문자열)
    @Query('searchField') searchField: string = 'username', // ✨ 검색할 필드 (기본값 'username')
    @Res() res: Response // ✨ Express Response 객체 주입
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // 검색 필드 유효성 검사 (프론트엔드와 일치하도록)
    const validSearchFields = ['username', 'name', 'email', 'phoneNumber', 'walletAddress', 'role'];
    if (searchField && !validSearchFields.includes(searchField)) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid search field provided.' });
    }

    try {
      // UserService의 findAllPaginatedAndFiltered 메서드를 호출합니다.
      const result = await this.userService.findAllPaginatedAndFiltered(
        pageNum,
        limitNum,
        searchQuery,
        searchField
      );
      // 프론트엔드의 응답 형식에 맞춰 data와 total을 함께 반환합니다.
      res.status(HttpStatus.OK).json({ data: result.users, total: result.total });
    } catch (error) {
      console.error('Error fetching admin users:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch users.' });
    }
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

  // 기타 어드민 전용 엔드포인트 추가 가능 (예: 특정 사용자 지갑 조회, 트랜잭션 수동 확인 등)
}