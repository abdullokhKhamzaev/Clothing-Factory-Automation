// export const TIMESTAMP_FORMAT = 'YYYY-MM-DD hh:mm A';
export const DATE_FORMAT = 'YYYY-MM-DD';

export const LANGUAGES = [
  {
    label: 'English',
    value: 'en'
  },
  {
    label: 'Uzbek',
    value: 'uz'
  },
  {
    label: 'Uzbek (Cyrillic)',
    value: 'uzCyrillic'
  }
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
export const SECTION_TYPES = [
  // cutter', 'embroidery', 'sewer', 'packager
  {
    label: 'cutter',
    value: 'cutter'
  },
  {
    label: 'embroidery',
    value: 'embroidery'
  },
  {
    label: 'sewer',
    value: 'sewer'
  },
  {
    label: 'packager',
    value: 'packager'
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

export const formatFloatToInteger = (number) => {
  let num = Number(number)
  // Split the number into integer and decimal parts
  const [integerPart, decimalPart] = num.toString().split('.');

  // Format the integer part with spaces as thousands separators
  const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  // If there's a decimal part, append it
  if (decimalPart !== undefined) {
    return `${formattedIntegerPart}.${decimalPart}`;
  } else {
    return formattedIntegerPart;
  }
};
