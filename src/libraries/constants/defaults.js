// export const TIMESTAMP_FORMAT = 'YYYY-MM-DD hh:mm A';
// export const DATE_FORMAT = 'MM-DD-YYYY';

export const LANGUAGES = [
  {
    label: 'English',
    value: 'en'
  },
  {
    label: 'Uzbek',
    value: 'uz'
  },
]

export const MEASUREMENTS = [
  {
    label: 'KG',
    value: 'kg'
  },
  {
    label: 'Dona',
    value: 'piece'
  }
]
export const PAGINATION_DEFAULTS = {
  rowsPerPage: 10,
  page: 1,
  sortBy: 'created_at',
  descending: true,
  rowsNumber: 0
};

export const ROLES = [
  { label: 'Admin', value: 'ROLE_ADMIN' },
  { label: 'User', value: 'ROLE_USER' },
  { label: 'Weaver', value: 'ROLE_WEAVER' },
];
