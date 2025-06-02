// server/src/migrations/AddUserRoleToUser1748828888888.ts (실제 파일명은 타임스탬프 포함)
import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddUserRoleToUser1748828434241 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. PostgreSQL에서 사용할 ENUM 타입 생성
        // 'user_role_enum'은 임의의 이름이며, 데이터베이스 스키마에서 실제 ENUM 타입의 이름이 됩니다.
        // ENUM 값들은 'user'와 'admin'으로 정의합니다.
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('user', 'admin')`);

        // 2. 'user' 테이블에 'role' 컬럼 추가
        await queryRunner.addColumn(
            'user', // 테이블 이름 (User 엔티티의 @Entity() 데코레이터에 이름이 명시되지 않았다면 'user'가 기본값)
            new TableColumn({
                name: 'role',
                type: 'enum', // TypeORM이 데이터베이스 ENUM 타입과 매핑
                enum: ['user', 'admin'], // ENUM의 허용 가능한 값들을 문자열 배열로 명시
                default: "'user'", // 기본값은 'user'. 문자열이므로 작은따옴표로 감싸야 함.
                isNullable: false, // 이 컬럼은 NULL이 될 수 없음.
            }),
        );

        // (선택 사항) 기존 사용자들의 role을 'user'로 설정 (새 컬럼 추가 시 기본값이 적용되므로 불필요할 수 있지만, 명시적으로 설정할 때)
        // await queryRunner.query(`UPDATE "user" SET "role" = 'user' WHERE "role" IS NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. 'user' 테이블에서 'role' 컬럼 삭제
        await queryRunner.dropColumn('user', 'role');

        // 2. PostgreSQL에서 생성했던 ENUM 타입 삭제
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }

}