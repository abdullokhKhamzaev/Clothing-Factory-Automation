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
  // 'cutter', 'cutterService', 'embroidery', 'embroideryService', 'sewer', 'sewerService', 'packager', 'packagerService', 'warehouse'
  {
    label: 'cutter',
    value: 'cutter'
  },
  {
    label: 'cutterService',
    value: 'cutterService'
  },
  {
    label: 'embroidery',
    value: 'embroidery'
  },
  {
    label: 'embroideryService',
    value: 'embroideryService'
  },
  {
    label: 'sewer',
    value: 'sewer'
  },
  {
    label: 'sewerService',
    value: 'sewerService'
  },
  {
    label: 'packager',
    value: 'packager'
  },
  {
    label: 'packagerService',
    value: 'packagerService'
  },
  {
    label: 'warehouse',
    value: 'warehouse'
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
  { label: 'ROLE_ADMIN', value: 'ROLE_ADMIN' },
  { label: 'ROLE_USER', value: 'ROLE_USER' },
  { label: 'ROLE_WEAVER', value: 'ROLE_WEAVER' },
  { label: 'ROLE_CUTTER', value: 'ROLE_CUTTER' },
  { label: 'ROLE_EMBROIDERER', value: 'ROLE_EMBROIDERER' },
  { label: 'ROLE_SEWER', value: 'ROLE_SEWER' },
  { label: 'ROLE_PACKAGER', value: 'ROLE_PACKAGER' },
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

export const formatDate = (dateString) => {
  // Split the input date at the 'T' to separate date and time
  const [datePart, timePart] = dateString.split('T');

  // Split the date part into year, month, and day
  const [year, month, day] = datePart.split('-');

  // Split the time part at the '+' (to remove the timezone offset)
  const [time] = timePart.split('+');

  // Return the formatted string
  return `${year}-${month}-${day} ${time.slice(0, 5)}`;
};
