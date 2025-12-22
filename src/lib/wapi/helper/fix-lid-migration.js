export function fixLidMigration(number) {
  let processedContactId = '';
  if (number.endsWith('@lid')) {
    const lidMatch = number.match(/^(\d+):\d+@lid$/);
    if (lidMatch && lidMatch[1]) {
      processedContactId = lidMatch[1] + '@lid';
    } else {
      processedContactId = number;
    }
  } else {
    processedContactId = number;
  }
  return processedContactId;
}
