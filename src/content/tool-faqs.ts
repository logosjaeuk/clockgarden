import type { Locale } from '../config';
import type { ToolKey } from './toolPages';
export const toolFaqs: Record<Locale, Record<ToolKey, string[][]>> = {
  en: {
    clock: [
      [
        'Is this a server time or ticketing clock?',
        'No. It displays your device time, not the time on a ticketing or registration server. Millisecond digits do not establish measurement accuracy.',
      ],
      [
        'How do I open the moving scenery?',
        'Enable Living Clock, then choose Browse scenes. Use the day preview to explore the artwork; return to current time before reading the clock.',
      ],
      [
        'Why does the screen still turn off?',
        'Wake lock can be refused or released by the browser, battery saver, or operating system. Check the toggle after returning to the tab.',
      ],
      [
        'Can I open every scene offline?',
        'Not necessarily. Previously visited pages may be cached, but image scenes load separately and are not guaranteed to be available offline.',
      ],
    ],
    stopwatch: [
      [
        'What is the difference between a lap and total time?',
        'A lap measures the interval since the previous lap. Total time measures all active time since Start, excluding pauses.',
      ],
      [
        'How do I save my recorded lap times?',
        'Record at least one lap, then download the CSV before refreshing or leaving. Lap records are kept only in the open page.',
      ],
      [
        'Will it measure time while my device sleeps?',
        'That depends on the browser and operating system. The stopwatch uses performance.now(); sleep behavior differs between platforms.',
      ],
      [
        'Which keyboard shortcuts actually work?',
        'Space starts or pauses, L records a lap, and R resets while paused. Shortcuts are ignored while typing in an input or using modifier keys.',
      ],
    ],
    timer: [
      [
        'Does a refresh reset the countdown?',
        "The timer stores its deadline in this tab's session storage and restores it on refresh when storage is available. Closing the tab is different and is not a reliable way to preserve a timer.",
      ],
      [
        'Will the alert sound after I close the tab?',
        'No reliable alert is possible from a closed or suspended page. Keep the tab open, check sound first, and use a device alarm for important deadlines.',
      ],
      [
        'Does Repeat switch between work and breaks?',
        'Repeat restarts the same duration. It does not automatically alternate a 25-minute work period and a 5-minute break; choose each duration yourself.',
      ],
      [
        'Why did the remaining time suddenly change?',
        'The countdown compares its deadline with the device clock. A manual clock change or system time correction can change the remaining time.',
      ],
    ],
    alarm: [
      [
        "Can this replace my phone's morning alarm?",
        'Use a native device alarm for waking up or other important reminders. Browser alarms cannot reliably run after the tab closes or the device sleeps.',
      ],
      [
        'Are my saved alarms shared between devices?',
        'No. Labels, times, and repeat settings are stored in this browser. Clearing site storage deletes those saved settings.',
      ],
      [
        'Why is the alarm silent when the time arrives?',
        "Check the page's sound setting, tab mute state, device volume, and browser permissions. Try a short test alarm while the tab is visible.",
      ],
      [
        'Which time zone does the alarm use?',
        "Alarms follow the device's local time. Review them after travel or a device time-zone change before relying on the scheduled time.",
      ],
    ],
    'world-clock': [
      [
        'Does the world clock show a future meeting time?',
        'It compares the current instant across locations. Use the time zone converter for a meeting on a particular future date.',
      ],
      [
        'Why does the time difference change during the year?',
        'Some locations change their UTC offset for daylight saving time. The world clock uses the time-zone rules supplied by your browser.',
      ],
      [
        'Can I search using CST or another abbreviation?',
        'Use a city or IANA identifier such as America/Chicago. Abbreviations can refer to different regions and are not a safe choice.',
      ],
      [
        'How can I keep the same cities next time?',
        'Your selected cities and their order are saved in this browser when local storage is available. They do not sync to other browsers.',
      ],
    ],
    'time-zone-converter': [
      [
        'Why must I enter the meeting date as well as the time?',
        'The UTC offset can change with the date. A conversion for today may give the wrong local time for a meeting in another season.',
      ],
      [
        'What happens when a local time does not exist?',
        'At a spring clock change some local times are skipped. The converter reports that gap so you can choose an actual time.',
      ],
      [
        'What happens when a local time occurs twice?',
        'At an autumn clock change an hour can repeat. Choose the intended UTC offset; the result link preserves that occurrence.',
      ],
      [
        'Can recipients use the result link to join a meeting?',
        'The link preserves conversion inputs and the selected occurrence. It does not create a calendar event, send invitations, or reserve a meeting room.',
      ],
    ],
  },
  ko: {
    clock: [
      [
        '티켓팅 서버 시간과 같은 시계인가요?',
        '아닙니다. 예매 서버나 수강신청 서버가 아닌 내 기기 시간을 표시합니다. 밀리초 숫자가 보인다고 밀리초 정확도가 보장되지는 않습니다.',
      ],
      [
        '움직이는 풍경은 어떻게 열 수 있나요?',
        'Living Clock을 켜고 씬 둘러보기에서 선택하세요. 하루 미리보기는 작품 감상용이므로 시간을 읽을 때는 현재 시간으로 돌아오세요.',
      ],
      [
        '화면 켜두기를 눌렀는데 왜 꺼지나요?',
        '브라우저나 운영체제의 절전 설정이 요청을 거절하거나 해제할 수 있습니다. 탭으로 돌아왔을 때 활성 상태를 확인하세요.',
      ],
      [
        '모든 장면을 오프라인에서 볼 수 있나요?',
        '보장하지 않습니다. 방문한 페이지가 저장될 수는 있지만 이미지 장면은 별도로 불러오므로 연결이 필요할 수 있습니다.',
      ],
    ],
    stopwatch: [
      [
        '랩 시간과 누적 시간은 무엇이 다른가요?',
        '랩은 직전 랩 이후의 구간 시간이며 누적 시간은 시작 이후 측정한 전체 시간입니다. 일시정지한 시간은 제외됩니다.',
      ],
      [
        '측정한 랩 기록은 어떻게 보관하나요?',
        '랩을 하나 이상 기록한 후 CSV를 다운로드하세요. 새로고침하거나 페이지를 떠나면 열려 있던 페이지의 랩 기록은 사라집니다.',
      ],
      [
        '기기가 절전 상태여도 계속 측정하나요?',
        '브라우저와 운영체제에 따라 다릅니다. 스톱워치는 performance.now()를 사용하며 절전 중 경과 시간 처리에는 플랫폼 차이가 있습니다.',
      ],
      [
        '사용 가능한 키보드 단축키는 무엇인가요?',
        '스페이스는 시작·일시정지, L은 랩, 정지 상태에서 R은 초기화입니다. 입력란에 글을 쓰거나 보조 키를 누를 때는 실행되지 않습니다.',
      ],
    ],
    timer: [
      [
        '새로고침하면 남은 시간이 초기화되나요?',
        '저장소를 사용할 수 있다면 같은 탭의 세션 저장소에 종료 시각을 저장해 새로고침 후 복원합니다. 탭을 닫은 뒤 복원되는 것은 보장하지 않습니다.',
      ],
      [
        '탭을 닫아도 종료 알림이 울리나요?',
        '닫히거나 중단된 페이지에서는 알림을 보장할 수 없습니다. 탭을 열어 두고 소리를 먼저 확인하세요. 중요한 마감은 기기 알람도 설정하세요.',
      ],
      [
        '반복 기능이 집중과 휴식을 번갈아 실행하나요?',
        '반복은 같은 길이의 타이머를 다시 실행합니다. 25분 집중과 5분 휴식을 자동으로 교대하지 않으므로 각 시간을 직접 선택하세요.',
      ],
      [
        '남은 시간이 갑자기 바뀌는 이유는 무엇인가요?',
        '카운트다운은 종료 시각과 기기 시각을 비교합니다. 기기 시간을 수동으로 바꾸거나 시스템이 보정하면 남은 시간도 달라질 수 있습니다.',
      ],
    ],
    alarm: [
      [
        '아침 기상 알람으로 사용해도 되나요?',
        '기상이나 중요한 약속에는 기기의 기본 알람을 사용하세요. 웹 알람은 탭 종료나 기기 절전 후 실행을 보장하지 못합니다.',
      ],
      [
        '저장한 알람이 다른 기기에도 나타나나요?',
        '아닙니다. 이름과 시각, 반복 설정은 이 브라우저에 저장됩니다. 사이트 저장소를 지우면 저장한 알람 설정도 삭제됩니다.',
      ],
      [
        '설정한 시각에 알람 소리가 나지 않아요.',
        '페이지 소리 설정, 탭 음소거, 기기 음량, 브라우저 권한을 확인하세요. 탭을 보이는 상태로 두고 짧은 테스트 알람을 먼저 설정하세요.',
      ],
      [
        '알람은 어느 지역 시간을 기준으로 하나요?',
        '기기의 현지 시간을 따릅니다. 여행하거나 기기 시간대를 바꾼 후에는 저장된 알람 시각을 다시 확인하세요.',
      ],
    ],
    'world-clock': [
      [
        '세계 시계로 미래 회의 시각도 볼 수 있나요?',
        '세계 시계는 현재 순간을 여러 지역 시간으로 비교합니다. 미래의 특정 날짜에 열릴 회의는 시간대 변환기를 사용하세요.',
      ],
      [
        '지역 사이의 시차가 계절마다 달라지는 이유는요?',
        '일부 지역이 일광 절약 시간에 따라 UTC 오프셋을 바꾸기 때문입니다. 이 도구는 브라우저가 제공하는 시간대 규칙을 사용합니다.',
      ],
      [
        'CST 같은 약어를 검색해도 되나요?',
        '약어는 여러 지역을 뜻할 수 있습니다. 도시 이름이나 America/Chicago 같은 IANA 식별자를 사용해 지역을 명확하게 선택하세요.',
      ],
      [
        '다음 방문에도 같은 도시 목록이 유지되나요?',
        '로컬 저장소를 사용할 수 있다면 도시 목록과 순서를 이 브라우저에 저장합니다. 다른 브라우저나 기기와 동기화되지는 않습니다.',
      ],
    ],
    'time-zone-converter': [
      [
        '시각뿐 아니라 날짜도 입력해야 하는 이유는요?',
        'UTC 오프셋은 날짜에 따라 달라질 수 있습니다. 오늘의 시차를 다른 계절의 회의에 그대로 적용하면 잘못된 시각을 안내할 수 있습니다.',
      ],
      [
        '현지에 존재하지 않는 시각을 입력하면 어떻게 되나요?',
        '봄철 시계 조정으로 건너뛰는 시각은 존재하지 않는 시간으로 안내합니다. 실제로 존재하는 다른 시각을 선택하세요.',
      ],
      [
        '같은 현지 시각이 두 번 나타나면 어떻게 하나요?',
        '가을철 시계 조정으로 중복되는 시각은 원하는 UTC 오프셋을 선택해야 합니다. 결과 링크에는 선택한 시각이 보존됩니다.',
      ],
      [
        '결과 링크를 복사하면 회의 초대도 생성되나요?',
        '링크는 입력 날짜와 지역, 중복 시각 선택을 보존합니다. 캘린더 일정이나 참석자 초대, 회의실 예약을 만드는 기능은 아닙니다.',
      ],
    ],
  },
};
