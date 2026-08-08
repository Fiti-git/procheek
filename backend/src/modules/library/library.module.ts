import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibraryDocument } from './entities/library-document.entity';
import { LibraryPurchase } from './entities/library-purchase.entity';
import { LibraryDownload } from './entities/library-download.entity';
import { LibraryService } from './library.service';
import { LibraryController } from './library.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([LibraryDocument, LibraryPurchase, LibraryDownload]),
  ],
  providers: [LibraryService],
  controllers: [LibraryController],
})
export class LibraryModule {}
