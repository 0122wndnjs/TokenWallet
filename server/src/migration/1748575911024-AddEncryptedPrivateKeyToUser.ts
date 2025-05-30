import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddEncryptedPrivateKeyToUser1748575911024 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // user 테이블에 encryptedPrivateKey 컬럼 추가
        await queryRunner.addColumn(
            'user', // 테이블 이름 (User 엔티티의 @Entity() 데코레이터에 이름이 명시되지 않았다면 'user'가 기본값)
            new TableColumn({
                name: 'encryptedPrivateKey',
                type: 'varchar',
                isNullable: true, // 개인키가 없는 사용자도 있을 수 있다면 true
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 마이그레이션 되돌리기 (encryptedPrivateKey 컬럼 삭제)
        await queryRunner.dropColumn('user', 'encryptedPrivateKey');
    }

}