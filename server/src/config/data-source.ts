import { DataSource } from 'typeorm';
import { User } from '../user/entities/user.entity'; // User 엔티티 경로 확인

// .env 파일의 내용을 읽어오기 위한 설정 (NestJS ConfigService와 별개로 TypeORM CLI가 사용)
import * as dotenv from 'dotenv';
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres', // 사용하시는 DB 타입 (예: 'mysql', 'sqlite', 'mongodb' 등)
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'your_db_user',
  password: process.env.DB_PASSWORD || 'your_db_password',
  database: process.env.DB_DATABASE || 'your_db_name',
  entities: [User], // 여기에 모든 엔티티 파일을 추가합니다.
  migrations: [__dirname + '/../migration/*.ts'], // 마이그레이션 파일 경로
  synchronize: false, // ✨ 중요: 프로덕션에서는 false로 설정해야 합니다! true면 앱 시작 시 스키마가 자동으로 동기화되어 데이터 손실 위험이 있습니다. 마이그레이션 사용 시에는 false!
  logging: true, // TypeORM 로그 활성화
});

export default AppDataSource;