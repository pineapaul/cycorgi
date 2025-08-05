const fs = require('fs');
const path = require('path');

// Files that need to be updated with compatibility fixes
const filesToUpdate = [
  'app/risk-management/workshops/[id]/edit/page.tsx',
  'app/risk-management/workshops/new/page.tsx',
  'app/risk-management/treatments/page.tsx',
  'app/risk-management/risks/[id]/page.tsx',
  'app/risk-management/treatments/[riskId]/[id]/page.tsx',
  'app/risk-management/treatments/[riskId]/new/page.tsx',
  'app/risk-management/register/[riskId]/page.tsx',
  'app/risk-management/draft-risks/page.tsx',
  'app/reports/risk/page.tsx'
];

// Pattern to find and replace
const oldPattern = /risk\.informationAsset\.map\(\(asset: any\) => asset\.name \|\| asset\.id \|\| asset\)\.join\(', '\)/g;
const newPattern = `risk.informationAsset.map((asset: any) => {
                        // Handle both new format (objects with id/name) and old format (strings)
                        if (typeof asset === 'object' && asset !== null) {
                          return asset.name || asset.id || JSON.stringify(asset)
                        }
                        return asset
                      }).join(', ')`;

// Alternative pattern for different variable names
const oldPattern2 = /treatment\.informationAsset\.map\(\(asset: any\) => asset\.name \|\| asset\.id \|\| asset\)\.join\(', '\)/g;
const newPattern2 = `treatment.informationAsset.map((asset: any) => {
                        // Handle both new format (objects with id/name) and old format (strings)
                        if (typeof asset === 'object' && asset !== null) {
                          return asset.name || asset.id || JSON.stringify(asset)
                        }
                        return asset
                      }).join(', ')`;

const oldPattern3 = /riskDetails\.informationAsset\.map\(\(asset: any\) => asset\.name \|\| asset\.id \|\| asset\)\.join\(', '\)/g;
const newPattern3 = `riskDetails.informationAsset.map((asset: any) => {
                        // Handle both new format (objects with id/name) and old format (strings)
                        if (typeof asset === 'object' && asset !== null) {
                          return asset.name || asset.id || JSON.stringify(asset)
                        }
                        return asset
                      }).join(', ')`;

const oldPattern4 = /result\.data\.informationAsset\.map\(\(asset: any\) => asset\.name \|\| asset\.id \|\| asset\)\.join\(', '\)/g;
const newPattern4 = `result.data.informationAsset.map((asset: any) => {
                        // Handle both new format (objects with id/name) and old format (strings)
                        if (typeof asset === 'object' && asset !== null) {
                          return asset.name || asset.id || JSON.stringify(asset)
                        }
                        return asset
                      }).join(', ')`;

const oldPattern5 = /selectedCloseRisk\.informationAsset\.map\(\(asset: any\) => asset\.name \|\| asset\.id \|\| asset\)\.join\(', '\)/g;
const newPattern5 = `selectedCloseRisk.informationAsset.map((asset: any) => {
                        // Handle both new format (objects with id/name) and old format (strings)
                        if (typeof asset === 'object' && asset !== null) {
                          return asset.name || asset.id || JSON.stringify(asset)
                        }
                        return asset
                      }).join(', ')`;

function updateFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Apply all patterns
    const patterns = [
      { old: oldPattern, new: newPattern },
      { old: oldPattern2, new: newPattern2 },
      { old: oldPattern3, new: newPattern3 },
      { old: oldPattern4, new: newPattern4 },
      { old: oldPattern5, new: newPattern5 }
    ];

    patterns.forEach(({ old, new: newContent }) => {
      if (old.test(content)) {
        content = content.replace(old, newContent);
        updated = true;
        console.log(`Updated pattern in ${filePath}`);
      }
    });

    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Fixing informationAsset compatibility issues...\n');
  
  let updatedCount = 0;
  let totalFiles = filesToUpdate.length;

  filesToUpdate.forEach(filePath => {
    if (updateFile(filePath)) {
      updatedCount++;
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`- Total files checked: ${totalFiles}`);
  console.log(`- Files updated: ${updatedCount}`);
  console.log(`- Files unchanged: ${totalFiles - updatedCount}`);
  
  if (updatedCount > 0) {
    console.log(`\n✅ Compatibility fixes applied successfully!`);
    console.log(`\nThe following changes were made:`);
    console.log(`- Updated mapping logic to handle both old (string) and new (object) formats`);
    console.log(`- Added type checking to safely extract asset names`);
    console.log(`- Maintained backward compatibility with existing data`);
  } else {
    console.log(`\nℹ️  No compatibility issues found. All files are already up to date.`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { updateFile, main }; 