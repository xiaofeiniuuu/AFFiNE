import { FavoriteItemsAdapter } from '@affine/core/modules/workspace';
import type { Collection, Filter } from '@affine/env/filter';
import type { DocMeta } from '@blocksuite/store';
import { useLiveData, useService, type Workspace } from '@toeverything/infra';
import { useMemo } from 'react';

import { usePublicPages } from '../../hooks/affine/use-is-shared-page';
import { filterPage, filterPageByRules } from './use-collection-manager';

export const useFilteredPageMetas = (
  workspace: Workspace,
  pageMetas: DocMeta[],
  options: {
    trash?: boolean;
    filters?: Filter[];
    collection?: Collection;
  } = {}
) => {
  const { getPublicMode } = usePublicPages(workspace);
  const favAdapter = useService(FavoriteItemsAdapter);
  const favoriteItems = useLiveData(favAdapter.favorites$);

  const filteredPageMetas = useMemo(
    () =>
      pageMetas.filter(pageMeta => {
        if (options.trash) {
          if (!pageMeta.trash) {
            return false;
          }
        } else if (pageMeta.trash) {
          return false;
        }
        const pageData = {
          meta: pageMeta,
          favorite: favoriteItems.some(fav => fav.id === pageMeta.id),
          publicMode: getPublicMode(pageMeta.id),
        };
        if (
          options.filters &&
          !filterPageByRules(options.filters, [], pageData)
        ) {
          return false;
        }

        if (options.collection && !filterPage(options.collection, pageData)) {
          return false;
        }

        return true;
      }),
    [
      pageMetas,
      options.trash,
      options.filters,
      options.collection,
      favoriteItems,
      getPublicMode,
    ]
  );

  return filteredPageMetas;
};
