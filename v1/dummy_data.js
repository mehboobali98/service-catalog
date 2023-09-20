const serviceCategories = [
  'My IT Assets',
  'View Raised Requests',
  'General IT Help',
  'HR Services',
  'Request New Software',
  'Request Laptops',
  'Request Mobile Devices',
  'Software Access'
];

// const serviceCatogoriesItems = [
//   'My IT Assets': {
//     description: 'List of everything within your custody. Easily report issues with your assigned devices or software.',
//     serviceItems: [
//       { 
//         name:    'Dell Insipiron 15 311',
//         img_src: 'adasd',
//         display_fields: [ 
//           { label: 'Serial #',    value: 'DSW42F4F' },
//           { label: 'Assigned On', value: '7 June 2021' }
//         ]
//       },
//       {
//         name:    'Jabra Evolve Headset',
//         img_src: 'asdasd',
//         display_fields: [
//           { label: 'Serial #',    value: 'DSW42F4F' },
//           { label: 'Assigned On', value: '7 June 2021' }
//         ]
//       },
//       {
//         name:    'Zoom',
//         img_src: 'asdasd',
//         display_fields: [
//           { label: 'Seats Given', value: '1' },
//           { label: 'Assigned On', value: '7 June 2021' }
//         ]
//       }
//     ]
//   },
//   'Request New Software': {
//     description: 'Browse and request available software for your needs or request a new one!',
//     serviceItems: [
//       {
//         name:    'Request New Software',
//         img_src: 'asdsad',
//         description: "Can't find the software you're looking for? Request a new one!"
//       },
//       {
//         name:
//         img_src: 'sdasd',
//         description: 'Slack description'
//       }
//     ]
//   }
// ];

function getServiceCategories() {
  return serviceCategories.map(serviceCategory => ({ id: generateId(str), name: serviceCategory, link: '#' }));
}

function getServiceCategoriesItems() {
  return serviceCatogoriesItems;
}

function getServiceCategoryItems(serviceCategory) {
  return serviceCatogoriesItems[serviceCategory];
}

function generateId(str) {
  str.toLowerCase().replace(/\s+/g, "_");
}

export { getServiceCategories, getServiceCategoriesItems, getServiceCategoryItems };