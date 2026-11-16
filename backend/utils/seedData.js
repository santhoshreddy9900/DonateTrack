const Donation = require('../models/Donation');
const Recipient = require('../models/Recipient');
const Distribution = require('../models/Distribution');

const sampleDonations = [
  {
    itemName: 'Thermal Blankets',
    category: 'Blankets & Bedding',
    quantity: 120,
    unit: 'units',
    donorName: 'Campus Red Cross Club',
    donorPhone: '+91 98765 11111',
    donorEmail: 'redcross@college.edu',
    donationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    notes: 'High-quality winter warm blankets'
  },
  {
    itemName: 'Notebooks & Pens Sets',
    category: 'Books & Stationery',
    quantity: 250,
    unit: 'sets',
    donorName: 'Engineering Dept Alumni 2022',
    donorPhone: '+91 98765 22222',
    donorEmail: 'alumni.eng@college.edu',
    donationDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    notes: 'Includes 4 ruled notebooks + blue & black pens'
  },
  {
    itemName: 'Warm Winter Jackets',
    category: 'Clothes & Apparel',
    quantity: 85,
    unit: 'pieces',
    donorName: 'Faculty & Staff Association',
    donorPhone: '+91 98765 33333',
    donorEmail: 'faculty.assoc@college.edu',
    donationDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    notes: 'Assorted sizes for adults and teens'
  },
  {
    itemName: 'Rice & Wheat Ration Bags',
    category: 'Food & Groceries',
    quantity: 160,
    unit: 'bags (5kg)',
    donorName: 'Hostel Mess Committee',
    donorPhone: '+91 98765 44444',
    donorEmail: 'mess.council@college.edu',
    donationDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    notes: 'Each packet contains 5kg grain'
  },
  {
    itemName: 'First Aid & Hygiene Kits',
    category: 'Medical & Hygiene',
    quantity: 70,
    unit: 'kits',
    donorName: 'College Health Centre & Pharmacy',
    donorPhone: '+91 98765 55555',
    donorEmail: 'healthcentre@college.edu',
    donationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    notes: 'Includes antiseptic, bandages, masks, soaps'
  },
  {
    itemName: 'Children Illustrated Books',
    category: 'Books & Stationery',
    quantity: 90,
    unit: 'books',
    donorName: 'Literary & Debating Society',
    donorPhone: '+91 98765 66666',
    donorEmail: 'lit.society@college.edu',
    donationDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    notes: 'Primary school reading material'
  },
  {
    itemName: 'Lentils & Pulses Packs',
    category: 'Food & Groceries',
    quantity: 110,
    unit: 'packs (2kg)',
    donorName: 'Dr. Ramesh Kumar (Dean of Academics)',
    donorPhone: '+91 98765 77777',
    donorEmail: 'dean.acad@college.edu',
    donationDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    notes: 'Nutritious dal packets'
  },
  {
    itemName: 'Board Games & Sports Kits',
    category: 'Toys & Recreation',
    quantity: 40,
    unit: 'kits',
    donorName: 'Rotaract Youth Club',
    donorPhone: '+91 98765 88888',
    donorEmail: 'rotaract@college.edu',
    donationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    notes: 'Chess, carrom, footballs, and drawing boards'
  }
];

const sampleRecipients = [
  {
    name: 'Sunshine Children Shelter',
    phone: '+91 91234 56789',
    address: 'Sector 4, Community Welfare Complex, Near City Park',
    requiredItems: ['Notebooks & Pens Sets', 'Warm Winter Jackets', 'Children Illustrated Books', 'Board Games & Sports Kits'],
    status: 'Active',
    organizationOrShelter: 'Sunshine NGO Foundation',
    familyMembersCount: 45,
    notes: 'Accommodates 45 resident children ages 5-16'
  },
  {
    name: 'City Night Shelter for Homeless',
    phone: '+91 92345 67890',
    address: 'Railway Colony Road, Platform 4 Back Gate',
    requiredItems: ['Thermal Blankets', 'Warm Winter Jackets', 'Rice & Wheat Ration Bags'],
    status: 'Active',
    organizationOrShelter: 'Municipal Social Welfare Dept',
    familyMembersCount: 80,
    notes: 'Providing emergency shelter during winter season'
  },
  {
    name: 'Asha Community Kitchen & Centre',
    phone: '+91 93456 78901',
    address: 'Block C-12, Gandhi Nagar Slum Settlement',
    requiredItems: ['Rice & Wheat Ration Bags', 'Lentils & Pulses Packs', 'First Aid & Hygiene Kits'],
    status: 'Active',
    organizationOrShelter: 'Asha Seva Trust',
    familyMembersCount: 60,
    notes: 'Serving daily meals to marginalized families'
  },
  {
    name: 'Rampur Village Primary Learning Hub',
    phone: '+91 94567 89012',
    address: 'Main Chowk, Village Rampur, Rural District',
    requiredItems: ['Notebooks & Pens Sets', 'Children Illustrated Books'],
    status: 'Active',
    organizationOrShelter: 'Rural Literacy Mission',
    familyMembersCount: 35,
    notes: 'After-school coaching centre for underprivileged kids'
  },
  {
    name: 'Mother Teresa Elderly Care Home',
    phone: '+91 95678 90123',
    address: '74 Civil Lines, Near General Hospital',
    requiredItems: ['Thermal Blankets', 'First Aid & Hygiene Kits'],
    status: 'Active',
    organizationOrShelter: 'Elders Hope Society',
    familyMembersCount: 28,
    notes: 'Care home for abandoned seniors'
  }
];

const seedInitialDataIfNeeded = async () => {
  try {
    const donationCount = await Donation.countDocuments();
    if (donationCount > 0) {
      console.log(`ℹ️ Database already contains ${donationCount} donation records.`);
      return;
    }

    console.log('🌱 Seeding initial college drive data...');
    const createdDonations = await Donation.insertMany(sampleDonations);
    const createdRecipients = await Recipient.insertMany(sampleRecipients);

    const sampleDistributions = [
      {
        recipient: createdRecipients[1]._id,
        recipientName: createdRecipients[1].name,
        itemName: 'Thermal Blankets',
        category: 'Blankets & Bedding',
        quantity: 35,
        unit: 'units',
        distributionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        status: 'Completed',
        distributedBy: 'Aarav Sharma (Volunteer)',
        notes: 'Delivered for night shelter winter drive'
      },
      {
        recipient: createdRecipients[0]._id,
        recipientName: createdRecipients[0].name,
        itemName: 'Notebooks & Pens Sets',
        category: 'Books & Stationery',
        quantity: 60,
        unit: 'sets',
        distributionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'Completed',
        distributedBy: 'Pooja Verma (Volunteer)',
        notes: 'Handed over for school term opening'
      },
      {
        recipient: createdRecipients[1]._id,
        recipientName: createdRecipients[1].name,
        itemName: 'Warm Winter Jackets',
        category: 'Clothes & Apparel',
        quantity: 30,
        unit: 'pieces',
        distributionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'Completed',
        distributedBy: 'Rohan Mehra (Volunteer)',
        notes: 'Distributed during evening inspection'
      },
      {
        recipient: createdRecipients[2]._id,
        recipientName: createdRecipients[2].name,
        itemName: 'Rice & Wheat Ration Bags',
        category: 'Food & Groceries',
        quantity: 45,
        unit: 'bags (5kg)',
        distributionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'Completed',
        distributedBy: 'Neha Patel (Volunteer)',
        notes: 'Supplied for weekly community kitchen'
      },
      {
        recipient: createdRecipients[3]._id,
        recipientName: createdRecipients[3].name,
        itemName: 'Children Illustrated Books',
        category: 'Books & Stationery',
        quantity: 30,
        unit: 'books',
        distributionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'Completed',
        distributedBy: 'Pooja Verma (Volunteer)',
        notes: 'Rural school library collection'
      },
      {
        recipient: createdRecipients[4]._id,
        recipientName: createdRecipients[4].name,
        itemName: 'First Aid & Hygiene Kits',
        category: 'Medical & Hygiene',
        quantity: 20,
        unit: 'kits',
        distributionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'Completed',
        distributedBy: 'Aarav Sharma (Volunteer)',
        notes: 'Monthly wellness care kit delivery'
      }
    ];

    await Distribution.insertMany(sampleDistributions);
    console.log(`✅ Pre-seeded ${createdDonations.length} donations, ${createdRecipients.length} recipients, and 6 distributions.`);
  } catch (err) {
    console.warn('⚠️ Auto-seeding warning:', err.message);
  }
};

module.exports = {
  sampleDonations,
  sampleRecipients,
  seedInitialDataIfNeeded
};
