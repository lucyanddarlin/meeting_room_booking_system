import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { MAX_PAGE_SIZE, defaultPaginationParams } from 'src/config';

export class CustomPaginationMeta {
  constructor(
    public readonly pageSize: number,
    public readonly totalCounts: number,
    public readonly totalPages: number,
    public readonly currentPage: number,
  ) {}
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
