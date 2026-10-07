const fs = require('fs');
const path = require('path');

const csvPath = path.resolve(__dirname, '../all_schools_from_uploaded_list (1).csv');
const rawCsv = fs.readFileSync(csvPath, 'utf-8');

// Known shortcodes and mottos for prominent schools
const KNOWN_DATA = {
  'presby boys senior high school, legon': {
    shortCode: 'PRESEC',
    slug: 'presec-legon',
    name: "Presbyterian Boys' Secondary School (Legon)",
    motto: 'In Lumine Tuo Videbimus Lumen (In Thy Light We Shall See Light)',
  },
  'achimota senior high school': {
    shortCode: 'MOTOWN',
    slug: 'achimota-school',
    name: 'Achimota School',
    motto: 'Ut Omnes Unum Sint (That All May Be One)',
  },
  'prempeh college': {
    shortCode: 'AMANFOO',
    slug: 'prempeh-college',
    name: 'Prempeh College',
    motto: 'Sub Animo Sibi (Character and Self-control)',
  },
  'opoku ware school': {
    shortCode: 'OWASS',
    slug: 'opoku-ware-school',
    name: 'Opoku Ware School',
    motto: 'Deus Lux Mea (God is My Light)',
  },
  'mfantsipim school': {
    shortCode: 'BOTWE',
    slug: 'mfantsipim-school',
    name: 'Mfantsipim School',
    motto: 'Dwin Hwe Kan (Think and Look Ahead)',
  },
  'adisadel college': {
    shortCode: 'ADISCO',
    slug: 'adisadel-college',
    name: 'Adisadel College',
    motto: 'Vel Primus Vel Cum Primis (Either the First or with the First)',
  },
  "st. augustine's college": {
    shortCode: 'AUGUSCO',
    slug: 'st-augustines-college',
    name: "St. Augustine's College",
    motto: 'Omnia Vincit Labor (Perseverance Conquers All)',
  },
  "wesley girls senior high school": {
    shortCode: 'WEYGEYHEY',
    slug: 'wesley-girls-high-school',
    name: "Wesley Girls' High School",
    motto: 'Live Pure, Speak True, Right Wrong, Follow the King',
  },
  "holy child senior high school": {
    shortCode: 'HOLICO',
    slug: 'holy-child-school',
    name: 'Holy Child School',
    motto: 'Facta Non Verba (Actions Not Words)',
  },
  "st. peter's senior high school": {
    shortCode: 'PERSCO',
    slug: 'st-peters-senior-high-school',
    name: "St. Peter's Boys' Senior High School",
    motto: 'Dignitati Hominum (For the Dignity of Mankind)',
  },
  "aburi girls senior high school": {
    shortCode: 'ABUGISS',
    slug: 'aburi-girls-senior-high-school',
    name: "Aburi Girls' Senior High School",
    motto: 'Bepow So Hann (Light on a Hill)',
  },
  'accra academy': {
    shortCode: 'BLEOO',
    slug: 'accra-academy',
    name: 'Accra Academy',
    motto: 'Esse Quam Videri (To Be, Rather Than to Seem)',
  },
  "st. thomas aquinas senior high school, cantoments": {
    shortCode: 'AQUINAS',
    slug: 'st-thomas-aquinas-senior-high-school',
    name: "St. Thomas Aquinas Senior High School",
    motto: 'Veritas Liberat (The Truth Sets Us Free)',
  },
  "pope john senior high school and minor seminary": {
    shortCode: 'POJOSS',
    slug: 'pope-john-senior-high-school',
    name: 'Pope John Senior High School & Minor Seminary',
    motto: 'Vela Damus (We Set Sail)',
  },
  "tamale senior high school": {
    shortCode: 'TAMASCO',
    slug: 'tamale-senior-high-school',
    name: 'Tamale Senior High School',
    motto: 'Fortiter, Fideliter, Feliciter',
  },
  "ghana national college": {
    shortCode: 'NATS',
    slug: 'ghana-national-college',
    name: 'Ghana National College',
    motto: 'Pro Patria (For God and Country)',
  },
  "bishop herman college": {
    shortCode: 'BIHECO',
    slug: 'bishop-herman-college',
    name: 'Bishop Herman College',
    motto: 'Sicut Miles Christi',
  },
  "mawuli school": {
    shortCode: 'MAWULI',
    slug: 'mawuli-school',
    name: 'Mawuli School',
    motto: 'Head, Heart and Hand',
  },
};

function titleCase(str) {
  return str
    .toLowerCase()
    .replace(/(?:^|\s|-|\/|\(|\))\S/g, (match) => match.toUpperCase())
    .replace(/\bShs\b/g, 'SHS')
    .replace(/\bShst\b/g, 'SHS/Tech')
    .replace(/\bVoc\b/g, 'Vocational')
    .replace(/\bTech\b/g, 'Technical')
    .replace(/\bInst\b/g, 'Institute')
    .replace(/\bComm\b/g, 'Community');
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const result = [];
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const fields = [];
    let insideQuotes = false;
    let current = '';

    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      const char = line[charIndex];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current.trim());
    if (fields.length >= 8) {
      result.push({
        sn: fields[0],
        region: fields[1],
        district: fields[2],
        school: fields[3].replace(/^"|"$/g, ''),
        location: fields[4],
        gender: fields[5],
        residency: fields[6],
        email: fields[7],
      });
    }
  }
  return result;
}

const parsed = parseCsv(rawCsv);
console.log(`Parsed ${parsed.length} rows from CSV.`);

const usedShortCodes = new Set();
const usedSlugs = new Set();
const usedNames = new Set();

const output = [];

for (const row of parsed) {
  const normKey = row.school.toLowerCase().trim();
  const known = KNOWN_DATA[normKey];

  let rawName = known?.name || titleCase(row.school);
  // Ensure name is unique
  let name = rawName;
  let nameCounter = 1;
  while (usedNames.has(name.toLowerCase())) {
    name = `${rawName} (${row.location || row.district})`;
    if (usedNames.has(name.toLowerCase())) {
      nameCounter++;
      name = `${rawName} (${row.location || row.district} #${nameCounter})`;
    }
  }
  usedNames.add(name.toLowerCase());

  // Slug
  let baseSlug = (known?.slug || name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  let slug = baseSlug;
  let slugCounter = 1;
  while (usedSlugs.has(slug)) {
    slugCounter++;
    slug = `${baseSlug}-${slugCounter}`;
  }
  usedSlugs.add(slug);

  // Short code
  let baseCode = known?.shortCode;
  if (!baseCode) {
    // Derive from email prefix if clean (e.g. mimshs@ges.gov.gh -> MIMSHS)
    const emailPrefix = (row.email.split('@')[0] || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (emailPrefix.length >= 3 && emailPrefix.length <= 10) {
      baseCode = emailPrefix;
    } else {
      // Acronym from school name words
      const words = row.school.replace(/[^a-zA-Z\s]/g, '').split(/\s+/).filter(Boolean);
      baseCode = words.map(w => w[0]).join('').toUpperCase().slice(0, 8);
      if (baseCode.length < 3) {
        baseCode = (row.school.replace(/[^a-zA-Z]/g, '').slice(0, 6) || 'SCH').toUpperCase();
      }
    }
  }

  let shortCode = baseCode;
  let codeCounter = 1;
  while (usedShortCodes.has(shortCode)) {
    codeCounter++;
    shortCode = `${baseCode}${codeCounter}`.slice(0, 10);
    if (usedShortCodes.has(shortCode)) {
      shortCode = `${baseCode.slice(0, 6)}_${codeCounter}`;
    }
  }
  usedShortCodes.add(shortCode);

  const regionTitle = titleCase(row.region);

  output.push({
    name,
    shortCode,
    slug,
    region: regionTitle,
    motto: known?.motto || null,
    crestUrl: null,
    turfScore: 0,
  });
}

console.log(`Generated ${output.length} unique schools.`);

const destPathWback = path.resolve(__dirname, '../../wback/prisma/schools.json');
const destPathAdmin = path.resolve(__dirname, '../prisma/schools.json');

fs.writeFileSync(destPathWback, JSON.stringify(output, null, 2), 'utf-8');
fs.writeFileSync(destPathAdmin, JSON.stringify(output, null, 2), 'utf-8');

console.log(`Successfully written schools.json to ${destPathWback} and ${destPathAdmin}`);
