function getServiceCategoriesItems() {
  return serviceCategoriesItems;
}

function getZendeskTicketFormData() {
  return zendeskTicketFormData;
}

const zendeskTicketFormData = {
  'my_it_assets': {
    'assigned_it_asset': {
      queryParams: {
        'type':                 'assigned_it_asset',
        'ticket_form_id':       '360001071720',
        'service_category':     'my_it_assets'
      },
      ticketFormData: {
        'custom_field_id':      '13884803612562',
        'custom_field_value':   'Report My Hardware Issue',
        'ticket_form_subject':  'Report Hardware Issue - '
      }
    },
    'assigned_software_entitlement': {
      queryParams: {
        'type':                 'assigned_software_entitlement',
        'ticket_form_id':       '360001071720',
        'service_category':     'my_it_assets'
      },
      ticketFormData: {
        'custom_field_id':      '13884803612562',
        'custom_field_value':   'Report My Software Issue',
        'ticket_form_subject':  'Report Software Issue - Assigned Software - '
      }
    }
  },
  'request_new_software': {
    queryParams: {
      'ticket_form_id':       '14009001995154',
      'service_category':     'request_new_software'
    },
    ticketFormData: {
      'custom_field_id':      '14008974403346',
      'custom_field_value':   'Request New Software',
      'ticket_form_subject':  'Request New Software - '
    }
  },
  'request_laptops': {
    queryParams: {
      'ticket_form_id':       '14009613233426',
      'service_category':     'request_laptops'
    },
    ticketFormData: {
      'custom_field_id':      '14008974403346',
      'custom_field_value':   'Request New Laptop',
      'ticket_form_subject':  'Request Laptops - '
    }
  }
};

const serviceCategoriesItems = {
  'my_it_assets': {
    label:       'My IT Assets',
    description: 'List of everything within your custody. Easily report issues with your assigned devices or software.'
  },
  'view_raised_requests': {
    label: 'View Raised Requests'
  },
  'general_it_help': {
    label: 'General IT Help'
  },
  'hr_services': {
    label: 'HR Services'
  },
  'request_new_software': {
    label:       'Request New Software',
    description: 'Browse and request available software for your needs or request a new one!',
    serviceItems: [
      {
        id:      '1',
        name:    'Request New Software',
        img_src: 'https://via.placeholder.com/100x100',
        description: "Can't find the software you're looking for? Request a new one!",
        detail_page_fields: [
          { label: 'Details', value: "Can't find the software you're looking for? Request a new one!" }
        ]
      },
      {
        id:      '2',
        name:    'Slack',
        price:   '$ 10.99',
        img_src: 'https://imgtr.ee/images/2023/09/28/28b8dba7d90f9b29f45c43203386a578.th.png',
        description: "SlackConnect Plus is the ultimate productivity-enhancing app for Slack, designed to supercharge your team's collaboration and communication experience. Elevate your Slack workspace to a whole new level with a range of powerful features that streamline workflows, boost efficiency, and facilitate seamless collaboration like never before.",
        detail_page_fields: [
          { label: 'Details',      value: "SlackConnect Plus is the ultimate productivity-enhancing app for Slack, designed to supercharge your team's collaboration and communication experience. Elevate your Slack workspace to a whole new level with a range of powerful features that streamline workflows, boost efficiency, and facilitate seamless collaboration like never before." },
          { label: 'Key features', value: "WIP" }
        ]
      },
      {
        id:       '3',
        name:     'Zoom',
        price:    '$ 10.99',
        img_src:  'https://imgtr.ee/images/2023/09/28/8ab5fdb0044dc698f5488ef80d62a1bd.th.png',
        description: 'Zoom is a video conferencing tool allowing you to meet online with other',
        detail_page_fields: [
          { label: 'Details',       value: 'Zoom is a video conferencing tool allowing you to meet online with other' },
          { label: 'Key features',  value: 'WIP' }
        ]
      },
      {
        id:       '4',
        name:     'Jira Software',
        price:    '$ 10.99',
        img_src:  'https://imgtr.ee/images/2023/09/28/b49d1afb3e877dcdbf33b5d6aa326fc2.th.png',
        description: 'Jira is a project management tool used by our Engineering teams',
        detail_page_fields: [
          { label: 'Details',       value: 'Jira is a project management tool used by our Engineering teams' },
          { label: 'Key features',  value: 'WIP' }
        ]
      },
      {
        id:       '5',
        name:     'SAP',
        price:    '$ 10.99',
        img_src:  'https://imgtr.ee/images/2023/09/28/f521919daf1c2c3f32080159283f53e1.th.png',
        description: 'SAP is an ERP tool currently being used to manage financial and accounting',
        detail_page_fields: [
          { label: 'Details',       value: 'SAP is an ERP tool currently being used to manage financial and accounting' },
          { label: 'Key features',  value: 'WIP' }
        ]
      },
      {
        id:       '6',
        name:     'Google Workspace',
        price:    '$ 10.99',
        img_src:  'https://imgtr.ee/images/2023/09/28/d4e71c1e782a3392489afd803111550d.th.png',
        description: 'Google Workspace allows you access to gmail, google calendar, docs, sheets, slides',
        detail_page_fields: [
          { label: 'Details',       value: 'Google Workspace allows you access to gmail, google calendar, docs, sheets, slides' },
          { label: 'Key features',  value: 'WIP' }
        ]
      }
    ]
  },
  'request_laptops': {
    label:       'Request Laptops',
    description: 'Browse and request available laptops for your needs or request a new one!',
    serviceItems: [
      {
        id:      '1',
        name:    'Standard Laptop',
        price:   '$ 650',
        img_src: 'https://imgtr.ee/images/2023/09/28/9cb7ceb9d672299ad44fc7f562c719be.th.png',
        description: "Request a standard laptop for your daily work tasks and productivity needs",
        detail_page_fields: [
          { label: 'Details',         value: "Request a standard laptop for your daily work tasks and productivity needs" },
          { label: 'Specifications',  value: "Processor: Intel Core i5, RAM: 8GB, Storage: 256GB SSD, Display: '14-inch FULL HD", format: 'list' },
          { label: '',                value: "To request a Standard laptop, simply click the 'Request Service' button" },
          { label: '',                value: "Please note that access to laptops may be subject to approval based on your role and team requirements" }
        ]
      },
      {
        id:      '2',
        name:    'Power Laptop',
        price:   '$ 1400',
        img_src: 'https://imgtr.ee/images/2023/09/28/3715af46c9c4368123ea28bfc436b7d0.th.png',
        description: "Request a high performance laptop with advanced Specifications",
        detail_page_fields: [
          { label: 'Details',         value: "Request a high performance laptop with advanced Specifications" },
          { label: 'Specifications',  value: "Processor: Intel Core i5, RAM: 8GB, Storage: 256GB SSD, Display: '14-inch FULL HD", format: 'list' },
          { label: '',                value: "To request a Power laptop, simply click the 'Request Service' button" },
          { label: '',                value: "Please note that access to laptops may be subject to approval based on your role and team requirements" }
        ]
      },
      {
        id:      '3',
        name:    'Macbook Pro',
        price:   '$ 1050',
        img_src: 'https://imgtr.ee/images/2023/09/28/7b81d46380869760beeebce74def90cd.th.png',
        description: "Request a Macbook Pro for seemless integration into the mac",
        detail_page_fields: [
          { label: 'Details',         value: "The MacBook Pro is a high-end laptop known for its power, sleek design, and Retina display. It offers Intel or Apple M1 processors, up to 64GB RAM, and SSD storage options. Graphics range from integrated to dedicated GPUs. It features Thunderbolt 3 ports, a comfortable keyboard, long battery life, and runs macOS with built-in security." },
          { label: 'Specifications',  value: "Processor: The MacBook Pro is equipped with powerful Intel or Apple-designed M1 processors, depending on the model. The M1 processors offer exceptional performance and energy efficiency. Memory (RAM): The RAM capacity varies by model but typically ranges from 8GB to 64GB, allowing for smooth multitasking and running demanding applications. Storage: It offers fast SSD storage with capacities ranging from 256GB to 8TB, ensuring quick data access and ample space for files. Graphics: The MacBook Pro features integrated Intel Iris Xe or Apple GPU, or in some cases, dedicated AMD Radeon graphics cards for enhanced graphics performance, especially in the 16-inch model. Display: The Retina display offers high resolution and color accuracy. The 13-inch model usually has a resolution of 2560 x 1600 pixels, while the 16-inch model boasts a 3072 x 1920 pixel resolution. Ports: Depending on the model, it may include Thunderbolt 3 (USB-C) ports for charging, data transfer, and connecting peripherals. The 16-inch model also includes additional ports like HDMI and an SD Card slot. Keyboard: Apple introduced the Magic Keyboard to replace the previous controversial Butterfly keyboard, offering a more comfortable typing experience. Battery Life: Battery life varies depending on usage, but MacBook Pros are known for their long-lasting batteries, often providing a full day of use on a single charge. Operating System: As of 2021, MacBook Pros run macOS, Apple's desktop operating system, which offers a user-friendly interface and access to a vast ecosystem of software and apps. Security: MacBook Pros feature Apple's T2 security chip or M1 security, which provides hardware-based security features like secure boot and data encryption. Audio: They typically come with high-quality speakers and a 3.5mm headphone jack, providing excellent audio quality for media consumption and video conferencing. Webcam: Equipped with a FaceTime HD camera for video calls and conferencing.", format: 'list' },
          { label: '',                value: "To request a Macbook Pro, simply click the 'Request Service' button" },
          { label: '',                value: "Please note that access to laptops may be subject to approval based on your role and team requirements" }
        ]
      },
      {
        id:      '4',
        name:    'Light and Portable',
        price:   '$ 550',
        img_src: 'https://imgtr.ee/images/2023/09/28/25eb22f0dc205a40fe47e39bfc4282d8.th.png',
        description: "Request a lightweight and portable laptop for enhanced mobility",
        detail_page_fields: [
          { label: 'Details',         value: "Request a lightweight and portable laptop for enhanced mobility" },
          { label: 'Specifications',  value: "Processor: Intel Core i5, RAM: 8GB, Storage: 256GB SSD, Display: '14-inch FULL HD", format: 'list' },
          { label: '',                value: "To request a Light and Portable laptop, simply click the 'Request Service' button" },
          { label: '',                value: "Please note that access to laptops may be subject to approval based on your role and team requirements" }
        ]
      },
      {
        id:      '5',
        name:    'Custom Configuration',
        img_src: 'https://imgtr.ee/images/2023/09/28/51095d44acc2122905f7bef86fb75dbb.th.png',
        description: "Request a laptop with custom configuration options tailored to your needs.",
        detail_page_fields: [
          { label: 'Details',         value: "Request a laptop with custom configuration options tailored to your needs" },
          { label: 'Specifications',  value: "Processor: Intel Core i5, RAM: 8GB, Storage: 256GB SSD, Display: '14-inch FULL HD", format: 'list' },
          { label: '',                value: "To request a Custom Configuration laptop, simply click the 'Request Service' button" },
          { label: '',                value: "Please note that access to laptops may be subject to approval based on your role and team requirements" }
        ]
      }
    ]
  },
  'request_mobile_devices': {
    label: 'Request Mobile Devices'
  },
  'software_access': {
    label: 'Software Access'
  }
};

function findServiceCategoryItem(searchParams, serviceCategoryItems) {
  const id   = searchParams.get('asset_id');
  const name = searchParams.get('asset_name');

  if (!id || !name) { return null; }

  for (let i = 0; i < serviceCategoryItems.length; i++) {
    if (serviceCategoryItems[i].id === id && serviceCategoryItems[i].name === name) {
      return serviceCategoryItems[i];
    }
  }
  return null; // Return null if no matching object is found
}

function updateServiceCategoryItems(demoData, serviceCategory, userAssignedAssetsAndSoftwareLicenses) {
  const newServiceItems = [];
  $.each(userAssignedAssetsAndSoftwareLicenses, function(key, records) {
    records = JSON.parse(records);
    if (key === 'assets' || key === 'software_entitlements') {
      $.each(records, function(index, record){
        let type = key === 'assets' ? 'assigned_it_asset' : 'assigned_software_entitlement';
        let serviceItemData = {
          id:             record['sequence_num'],
          name:           record['name'],
          type:           type,
          img_src:        record['img_src'],
          display_fields: prepareDisplayFieldsData(type, record)
        };
        newServiceItems.push(serviceItemData);
      });
    }
  });
  if (newServiceItems.length > 0) {
    demoData[serviceCategory]['serviceItems'] = newServiceItems;
  }
  return demoData;
}

function prepareDisplayFieldsData(type, record) {
  const displayFields = [];
  if (type === 'assigned_it_asset') {
    displayFields.push({
      label: 'Serial #', value: record['serial_num']
    });
  } else if (type === 'assigned_software_entitlement') {
    displayFields.push({
      label: 'Seats Given', value: record['seats_given']
    })
  }
  displayFields.push({ label: 'Assigned On', value: record['assigned_on'] });
  return displayFields;
}

function extractServiceItemsWithCategory(demoData) {
  const extractedServiceItems = [];

  for (const categoryName in demoData) {
    if (demoData.hasOwnProperty(categoryName)) {
      const category      = demoData[categoryName];
      const categoryLabel = category.label;
      const serviceItems  = category.serviceItems;

      if (serviceItems) {
        for (const serviceItem of serviceItems) {
          // Add the service category name to the service item
          serviceItem.serviceCategoryName = categoryName;
          extractedServiceItems.push(serviceItem);
        }
      }
    }
  }

  return extractedServiceItems;
}

export { getServiceCategoriesItems, getZendeskTicketFormData, findServiceCategoryItem, updateServiceCategoryItems, extractServiceItemsWithCategory };
