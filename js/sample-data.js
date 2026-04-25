'use strict';

const SAMPLE_DATA = [
  // Google — 7
  { firstName: 'Sarah',     lastName: 'Chen',      company: 'Google',     position: 'Software Engineer',            connectedOn: '15 Mar 2019' },
  { firstName: 'Michael',   lastName: 'Torres',    company: 'Google',     position: 'Product Manager',              connectedOn: '22 Jul 2020' },
  { firstName: 'Emily',     lastName: 'Park',      company: 'Google',     position: 'Data Scientist',               connectedOn: '08 Nov 2018' },
  { firstName: 'James',     lastName: 'Liu',       company: 'Google',     position: 'Software Engineer II',          connectedOn: '14 Feb 2021' },
  { firstName: 'Rachel',    lastName: 'Kim',       company: 'Google',     position: 'UX Designer',                  connectedOn: '30 May 2022' },
  { firstName: 'David',     lastName: 'Wang',      company: 'Google',     position: 'Site Reliability Engineer',     connectedOn: '19 Sep 2017' },
  { firstName: 'Aisha',     lastName: 'Johnson',   company: 'Google',     position: 'Technical Program Manager',     connectedOn: '11 Jan 2023' },

  // Microsoft — 6
  { firstName: 'Kevin',     lastName: 'Brown',     company: 'Microsoft',  position: 'Software Engineer',            connectedOn: '03 Jun 2016' },
  { firstName: 'Lisa',      lastName: 'Zhang',     company: 'Microsoft',  position: 'Senior PM',                    connectedOn: '27 Oct 2020' },
  { firstName: 'Ryan',      lastName: 'Patel',     company: 'Microsoft',  position: 'Software Engineer II',          connectedOn: '16 Apr 2019' },
  { firstName: 'Jessica',   lastName: 'Wu',        company: 'Microsoft',  position: 'Product Designer',             connectedOn: '05 Aug 2021' },
  { firstName: 'Mark',      lastName: 'Anderson',  company: 'Microsoft',  position: 'Engineering Manager',          connectedOn: '01 Dec 2015' },
  { firstName: 'Priya',     lastName: 'Singh',     company: 'Microsoft',  position: 'Data Scientist',               connectedOn: '20 Mar 2022' },

  // Meta — 5
  { firstName: 'Alex',      lastName: 'Rodriguez', company: 'Meta',       position: 'Software Engineer',            connectedOn: '14 Jun 2021' },
  { firstName: 'Hannah',    lastName: 'Lee',       company: 'Meta',       position: 'Product Designer',             connectedOn: '08 Sep 2020' },
  { firstName: 'Chris',     lastName: 'Taylor',    company: 'Meta',       position: 'Software Engineer III',         connectedOn: '22 Mar 2018' },
  { firstName: 'Maya',      lastName: 'Patel',     company: 'Meta',       position: 'Product Manager',              connectedOn: '30 Nov 2022' },
  { firstName: 'Brandon',   lastName: 'Foster',    company: 'Meta',       position: 'ML Engineer',                  connectedOn: '01 Apr 2023' },

  // Amazon — 5
  { firstName: 'Sam',       lastName: 'Mitchell',  company: 'Amazon',     position: 'SDE II',                       connectedOn: '18 Jul 2017' },
  { firstName: 'Olivia',    lastName: 'Chen',      company: 'Amazon',     position: 'Product Manager',              connectedOn: '09 Dec 2019' },
  { firstName: 'Tyler',     lastName: 'Johnson',   company: 'Amazon',     position: 'Software Dev Engineer',         connectedOn: '28 Feb 2020' },
  { firstName: 'Natalie',   lastName: 'Kim',       company: 'Amazon',     position: 'Data Engineer',                connectedOn: '15 Oct 2021' },
  { firstName: 'Daniel',    lastName: 'Park',      company: 'Amazon',     position: 'SDE III',                      connectedOn: '11 May 2016' },

  // Stripe — 4
  { firstName: 'Nina',      lastName: 'Gupta',     company: 'Stripe',     position: 'Software Engineer',            connectedOn: '19 Aug 2022' },
  { firstName: 'Carlos',    lastName: 'Mendez',    company: 'Stripe',     position: 'Product Manager',              connectedOn: '06 May 2021' },
  { firstName: 'Sophie',    lastName: 'Williams',  company: 'Stripe',     position: 'Backend Engineer',             connectedOn: '23 Nov 2020' },
  { firstName: 'Jake',      lastName: 'Thompson',  company: 'Stripe',     position: 'Infrastructure Engineer',       connectedOn: '14 Feb 2023' },

  // Airbnb — 4
  { firstName: 'Emma',      lastName: 'Davis',     company: 'Airbnb',     position: 'Frontend Engineer',            connectedOn: '07 Aug 2019' },
  { firstName: 'Liam',      lastName: 'Wilson',    company: 'Airbnb',     position: 'Product Designer',             connectedOn: '25 Mar 2021' },
  { firstName: 'Grace',     lastName: 'Liu',       company: 'Airbnb',     position: 'Product Manager',              connectedOn: '12 Jun 2020' },
  { firstName: 'Victor',    lastName: 'Chen',      company: 'Airbnb',     position: 'Full Stack Engineer',           connectedOn: '01 Sep 2022' },

  // Salesforce — 3
  { firstName: 'Mia',       lastName: 'Robinson',  company: 'Salesforce', position: 'Solutions Engineer',            connectedOn: '30 Apr 2018' },
  { firstName: 'Noah',      lastName: 'Clark',     company: 'Salesforce', position: 'Product Manager',              connectedOn: '17 Jan 2020' },
  { firstName: 'Zoe',       lastName: 'Martinez',  company: 'Salesforce', position: 'Senior Developer',             connectedOn: '08 Jun 2023' },

  // Netflix — 3
  { firstName: 'Ethan',     lastName: 'Hall',      company: 'Netflix',    position: 'Software Engineer',            connectedOn: '20 Nov 2021' },
  { firstName: 'Isabella',  lastName: 'Moore',     company: 'Netflix',    position: 'Data Scientist',               connectedOn: '14 Jul 2019' },
  { firstName: 'Lucas',     lastName: 'White',     company: 'Netflix',    position: 'Infrastructure Engineer',       connectedOn: '03 Apr 2022' },

  // Uber — 2
  { firstName: 'Charlotte', lastName: 'Harris',    company: 'Uber',       position: 'Software Engineer',            connectedOn: '26 Aug 2020' },
  { firstName: 'Owen',      lastName: 'Jackson',   company: 'Uber',       position: 'Product Manager',              connectedOn: '15 Dec 2022' },

  // Dropbox — 2
  { firstName: 'Ava',       lastName: 'Thompson',  company: 'Dropbox',    position: 'Software Engineer',            connectedOn: '04 Oct 2017' },
  { firstName: 'Mason',     lastName: 'Young',     company: 'Dropbox',    position: 'Product Designer',             connectedOn: '29 Jul 2021' },

  // Singletons
  { firstName: 'Sophia',    lastName: 'Adams',     company: 'Figma',      position: 'Product Designer',             connectedOn: '17 Mar 2023' },
  { firstName: 'Elijah',    lastName: 'Baker',     company: 'Notion',     position: 'Software Engineer',            connectedOn: '05 Oct 2022' },
  { firstName: 'Amelia',    lastName: 'Nelson',    company: 'Linear',     position: 'Software Engineer',            connectedOn: '22 May 2023' },
  { firstName: 'William',   lastName: 'Garcia',    company: 'Coinbase',   position: 'Blockchain Engineer',          connectedOn: '09 Jan 2022' },
  { firstName: 'Chloe',     lastName: 'Bennett',   company: 'Vercel',     position: 'Developer Advocate',           connectedOn: '14 Nov 2022' },
];
