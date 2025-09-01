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
  },
  {
    label: 'Metr',
    value: 'meter'
  }
]

export const TRANSACTION_REASONS = [
  {
    label: 'Tax',
    value: 'tax'
  },
  {
    label: 'Electricity',
    value: 'electricity'
  },
  {
    label: 'Gas',
    value: 'gas'
  },
  {
    label: 'Water',
    value: 'water'
  },
  {
    label: 'Repair',
    value: 'repair'
  },
  {
    label: 'Fare',
    value: 'fare'
  },
  {
    label: 'Food',
    value: 'food'
  },
  {
    label: 'SaleShare',
    value: 'saleShare'
  },
  {
    label: 'Other',
    value: 'other'
  },
  {
    label: 'Other Product cost',
    value: 'productcost'
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

export const WAREHOUSES = {
  cutterWarehouse: '/api/warehouses/1',
  cutterWarehouseDefective: '/api/warehouses/2',
  embroideryWarehouse: '/api/warehouses/3',
  embroideryReadyWarehouse: '/api/warehouses/4',
  sewerWarehouse: '/api/warehouses/5',
  packagerWarehouse: '/api/warehouses/7',
  packagerReadyWarehouse: '/api/warehouses/8',
  productsWarehouse: '/api/warehouses/9',
};

export const ROLES = [
  { label: 'ROLE_ADMIN', value: 'ROLE_ADMIN' },
  { label: 'ROLE_USER', value: 'ROLE_USER' },
  { label: 'ROLE_WEAVER', value: 'ROLE_WEAVER' },
  { label: 'ROLE_CUTTER', value: 'ROLE_CUTTER' },
  { label: 'ROLE_EMBROIDERER', value: 'ROLE_EMBROIDERER' },
  { label: 'ROLE_SEWER', value: 'ROLE_SEWER' },
  { label: 'ROLE_PACKAGER', value: 'ROLE_PACKAGER' },
  { label: 'ROLE_MASTER', value: 'ROLE_MASTER' },
  { label: 'ROLE_MERCHANT', value: 'ROLE_MERCHANT' },
  { label: 'ROLE_SUPER_ADMIN', value: 'ROLE_SUPER_ADMIN' },
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

export const isToday = (dateStr) => {
  const inputDate = new Date(dateStr);
  const today = new Date();

  return (
    inputDate.getFullYear() === today.getFullYear() &&
    inputDate.getMonth() === today.getMonth() &&
    inputDate.getDate() === today.getDate()
  );
};

export function getStats(actions) {
  const stats = {};
  const statsByUser = {};
  const userStats = {};
  const statsByModel = {};
  let total = 0;

  if (actions) {
    actions.forEach(action => {
      const modelName = action.productModel?.name || 'Unknown Model';
      const quantities = action.productSize.map(sizeItem => sizeItem.quantity || 0);
      const totalQuantity = quantities.reduce((sum, q) => sum + q, 0);
      const packagerName = action.sentBy?.fullName || 'Unknown';

      // Track total by model
      if (!stats[modelName]) {
        stats[modelName] = 0;
      }
      stats[modelName] += totalQuantity;

      // Track by model and packager (Model -> Packager -> Quantity)
      if (!statsByUser[modelName]) {
        statsByUser[modelName] = {};
      }
      if (!statsByUser[modelName][packagerName]) {
        statsByUser[modelName][packagerName] = 0;
      }
      statsByUser[modelName][packagerName] += totalQuantity;

      // Track total by user
      if (!userStats[packagerName]) {
        userStats[packagerName] = 0;
      }
      userStats[packagerName] += totalQuantity;

      // Track by user and model (User -> Model -> Quantity)
      if (!statsByModel[packagerName]) {
        statsByModel[packagerName] = {};
      }
      if (!statsByModel[packagerName][modelName]) {
        statsByModel[packagerName][modelName] = 0;
      }
      statsByModel[packagerName][modelName] += totalQuantity;

      total += totalQuantity;
    });
  }

  return { stats, statsByUser, userStats, statsByModel, total };
}
