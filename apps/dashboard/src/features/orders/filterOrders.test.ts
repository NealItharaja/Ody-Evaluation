import { toOrdersQuery } from './filterOrders';

describe('toOrdersQuery', () => {
  it('omits all/empty so the API applies its defaults', () => {
    expect(toOrdersQuery({ status: 'all', channel: 'all', search: '  ' })).toEqual({
      status: undefined,
      channel: undefined,
      search: undefined,
    });
  });

  it('forwards open status and a search term', () => {
    expect(toOrdersQuery({ status: 'open', channel: 'delivery', search: 'RV-1042' })).toEqual({
      status: 'open',
      channel: 'delivery',
      search: 'RV-1042',
    });
  });
});
