npm i

npm run dev

TODO:

Правки:

- memoizedFn - нужно использовать хук useEvent, вместо useRef ++++
- status:
  JavaScript

const [status, setStatus] = useState<'init'|'success'|'error'|'fetching'>('')

- нужно добавить базовый кеш + ключ кеширования ++++

```TypeScript
const vehiclesListQueryKey = ['vehicleList', pagination, search];

const { data: vehiclesData, ...queryData } = useAppQuery({
queryKey: vehiclesListQueryKey,
queryFn: () =>
    apiClient.assets.assetsVehicleList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    search: search,
    }),
enabled,
});


- нужно подумать про отмену предыдущих запросов ++++
- подчищать error при перезапросах +++
```
