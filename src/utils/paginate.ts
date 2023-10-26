import { ApiProperty } from '@nestjs/swagger';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { MAX_PAGE_SIZE, defaultPaginationParams } from 'src/config';

export class CustomPaginationMeta {
  @ApiProperty()
  public readonly pageSize: number;
  @ApiProperty()
  public readonly totalCounts: number;
  @ApiProperty()
  public readonly totalPages: number;
  @ApiProperty()
  public readonly currentPage: number;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(pageSize, totalCounts, totalPages, currentPage) {}
}

/**
 * 获取分页的 options
 * @param page
 */
export const getPaginationOptions = (
  page: number = defaultPaginationParams.currentPage,
  size: number = defaultPaginationParams.pageSize,
) => {
  const limit = size > MAX_PAGE_SIZE ? MAX_PAGE_SIZE : size;
  const options: IPaginationOptions<CustomPaginationMeta> = {
    page,
    limit,
    metaTransformer(meta): CustomPaginationMeta {
      return new CustomPaginationMeta(
        meta.itemCount,
        meta.totalItems,
        meta.totalPages,
        meta.currentPage,
      );
    },
  };
  return options;
};
