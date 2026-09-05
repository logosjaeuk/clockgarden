const numbers = [
  'ZERO',
  'ONE',
  'TWO',
  'THREE',
  'FOUR',
  'FIVE',
  'SIX',
  'SEVEN',
  'EIGHT',
  'NINE',
  'TEN',
  'ELEVEN',
  'TWELVE',
  'THIRTEEN',
  'FOURTEEN',
  'FIFTEEN',
  'SIXTEEN',
  'SEVENTEEN',
  'EIGHTEEN',
  'NINETEEN',
];
// Separate hour and minute occurrences preserve reading order and repeated words.
const rows = [
  ['intro:IT', 'intro:IS'],
  ['h:ONE', 'h:TWO', 'h:THREE', 'h:FOUR'],
  ['h:FIVE', 'h:SIX', 'h:SEVEN'],
  ['h:EIGHT', 'h:NINE', 'h:TEN'],
  ['h:ELEVEN', 'h:TWELVE'],
  ['m:OH', 'm:OCLOCK'],
  ['m:TEN', 'm:ELEVEN', 'm:TWELVE'],
  ['m:THIRTEEN', 'm:FOURTEEN'],
  ['m:FIFTEEN', 'm:SIXTEEN'],
  ['m:SEVENTEEN', 'm:EIGHTEEN'],
  ['m:NINETEEN'],
  ['m:TWENTY', 'm:THIRTY'],
  ['m:FORTY', 'm:FIFTY'],
  ['m:ONE', 'm:TWO', 'm:THREE', 'm:FOUR'],
  ['m:FIVE', 'm:SIX', 'm:SEVEN'],
  ['m:EIGHT', 'm:NINE'],
];
const positions = new Map<string, number[]>();
const letters: string[] = [];
rows.forEach((row, r) => {
  row.forEach((key) => {
    const word = key.split(':')[1]!;
    positions.set(
      key,
      Array.from(word, (_, i) => letters.length + i),
    );
    letters.push(...word);
  });
  while (letters.length < (r + 1) * 18)
    letters.push('TIMEANDLIGHT'[(letters.length * 7 + r) % 12]!);
});
export function englishMatrix(hour: number, minute: number) {
  const hourWord = numbers[hour % 12 || 12]!;
  const minuteWords =
    minute === 0
      ? ['OCLOCK']
      : minute < 10
        ? ['OH', numbers[minute]!]
        : minute < 20
          ? [numbers[minute]!]
          : [
              ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY'][Math.floor(minute / 10)]!,
              ...(minute % 10 ? [numbers[minute % 10]!] : []),
            ];
  const keys = ['intro:IT', 'intro:IS', `h:${hourWord}`, ...minuteWords.map((w) => `m:${w}`)];
  return {
    letters,
    active: keys.flatMap((k) => positions.get(k)!),
    phrase: ['IT', 'IS', hourWord, ...minuteWords].join(' '),
  };
}
