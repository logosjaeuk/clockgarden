import { englishMatrix } from '../lib/word-matrix';
const english = [
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
const hours = [
  '열두',
  '한',
  '두',
  '세',
  '네',
  '다섯',
  '여섯',
  '일곱',
  '여덟',
  '아홉',
  '열',
  '열한',
];
const digits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
export function renderWords(world: HTMLElement, date: Date, ko: boolean) {
  const hour = date.getHours(),
    minute = date.getMinutes();
  const text = (selector: string, value: string) => {
    const el = world.querySelector(selector)!;
    if (el.textContent !== value) el.textContent = value;
  };
  text('[data-word-period]', ko ? (hour < 12 ? '오전' : '오후') : hour < 12 ? 'AM' : 'PM');
  text('[data-word-hour]', ko ? hours[hour % 12] + ' 시' : english[hour % 12 || 12]!);
  const tens = Math.floor(minute / 10),
    ones = minute % 10;
  const koreanMinute = (tens ? (tens === 1 ? '' : digits[tens]) + '십' : '') + digits[ones] + ' 분';
  const englishMinute =
    minute < 20
      ? english[minute]
      : ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY'][tens] + (ones ? ' ' + english[ones] : '');
  text(
    '[data-word-minute]',
    minute === 0
      ? ko
        ? '정각'
        : 'O’CLOCK'
      : ko
        ? koreanMinute
        : (minute < 10 ? 'OH ' : '') + englishMinute,
  );
  const face = world.querySelector<HTMLElement>('.word-face')!;
  let grid = face.querySelector<HTMLElement>('.word-grid');
  const matrix = englishMatrix(hour, minute);
  const labels = ko
    ? Array.from('한두세네다섯여섯일곱여덟아홉열한두시이삼사오십초일이삼사오육칠팔구정각분')
    : matrix.letters;
  if (!grid) {
    grid = document.createElement('div');
    grid.className = 'word-grid';
    grid.classList.toggle('word-grid-en', !ko);
    grid.setAttribute('aria-hidden', 'true');
    for (const label of labels) {
      const cell = document.createElement('span');
      cell.textContent = label;
      grid.append(cell);
    }
    face.append(grid);
  }
  const active = new Set<number>();
  if (ko) {
    const hourCells = [
      [14, 16],
      [0],
      [1],
      [2],
      [3],
      [4, 5],
      [6, 7],
      [8, 9],
      [10, 11],
      [12, 13],
      [14],
      [14, 15],
    ];
    hourCells[hour % 12]!.forEach((i) => active.add(i));
    active.add(17);
    if (minute === 0) {
      active.add(33);
      active.add(34);
    } else {
      active.add(35);
      if (tens) {
        active.add(22);
        if (tens > 1) active.add(16 + tens);
      }
      if (ones) active.add(23 + ones);
    }
  } else {
    matrix.active.forEach((i) => active.add(i));
  }
  grid.setAttribute(
    'data-phrase',
    ko
      ? `${hour < 12 ? '오전' : '오후'} ${hours[hour % 12]} 시 ${minute === 0 ? '정각' : koreanMinute}`
      : `${matrix.phrase} · ${hour < 12 ? 'AM' : 'PM'}`,
  );
  Array.from(grid.children).forEach((cell, i) => cell.classList.toggle('lit', active.has(i)));
  const progress = world.querySelector<SVGRectElement>('.word-progress')!;
  progress.style.strokeDasharray = `${date.getSeconds()} 60`;
}
