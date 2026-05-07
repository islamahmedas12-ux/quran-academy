import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6 metrics';

const errorRate = new Rate('errors');
const apiLatency = new Trend('api_latency');
const pageLoadLatency = new Trend('page_load_latency');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
const FRONTEND_URL = __ENV.FRONTEND_URL || 'http://localhost:3000';

export const options = {
  scenarios: {
    classBooking: {
      executor: 'constant-vus',
      vus: 100,
      duration: '5m',
      tags: { scenario: 'class-booking' },
    },
    quranReading: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '4m', target: 50 },
        { duration: '30s', target: 0 },
      ],
      tags: { scenario: 'quran-reading' },
    },
    liveClass: {
      executor: 'constant-vus',
      vus: 20,
      duration: '10m',
      tags: { scenario: 'live-class' },
    },
  },
  thresholds: {
    'api_latency': ['p(95)<500'],
    'page_load_latency': ['p(95)<1000'],
    'errors': ['rate<0.05'],
    'http_req_duration': ['p(95)<800'],
  },
};

const teacherIds = ['teacher-1', 'teacher-2', 'teacher-3', 'teacher-4', 'teacher-5'];
const studentEmails = Array.from({ length: 100 }, (_, i) => `student${i}@example.com`);

export function setup() {
  const authRes = http.post(`${BASE_URL}/auth/magic-link`, JSON.stringify({
    email: 'admin@example.com',
    organizationId: 'org-1',
  }), { headers: { 'Content-Type': 'application/json' } });
  
  const token = authRes.json('token');
  return { authToken: token };
}

export default function(data: { authToken: string }) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.authToken}`,
  };

  switch (__ITER) % 3) {
    case 0:
      bookClass(headers);
      break;
    case 1:
      readQuran(headers);
      break;
    case 2:
      joinLiveClass(headers);
      break;
  }
}

function bookClass(headers: Record<string, string>) {
  const teacherId = teacherIds[Math.floor(Math.random() * teacherIds.length)];
  const studentEmail = studentEmails[Math.floor(Math.random() * studentEmails.length)];
  
  const startTime = new Date(Date.now() + 86400000).toISOString();
  
  const res = http.post(
    `${BASE_URL}/classes/book`,
    JSON.stringify({
      teacherId,
      studentEmail,
      startTime,
      organizationId: 'org-1',
    }),
    { headers, tags: { name: 'bookClass' } }
  );
  
  const latency = apiLatency.add(res.timings.duration);
  errorRate.add(res.status !== 201 && res.status !== 200);
  
  check(res, {
    'booking status is 201 or 200': (r) => r.status === 201 || r.status === 200,
    'booking response has sessionId': (r) => !!r.json('sessionId'),
  });
  
  sleep(1);
}

function readQuran(headers: Record<string, string>) {
  const surahNumber = Math.floor(Math.random() * 114) + 1;
  
  const res = http.get(
    `${BASE_URL}/quran/surah/${surahNumber}`,
    { headers, tags: { name: 'readQuran' } }
  );
  
  const latency = apiLatency.add(res.timings.duration);
  errorRate.add(res.status !== 200);
  
  check(res, {
    'quran surah status is 200': (r) => r.status === 200,
    'surah has verses': (r) => Array.isArray(r.json('verses')) && r.json('verses').length > 0,
  });
  
  if (res.status === 200) {
    const verses = res.json('verses') as Array<{ audioUrl: string }>;
    if (verses.length > 0 && verses[0].audioUrl) {
      const audioRes = http.get(`${BASE_URL}${verses[0].audioUrl}`, {
        tags: { name: 'audioStream' },
      });
      errorRate.add(audioRes.status !== 200);
    }
  }
  
  sleep(2);
}

function joinLiveClass(headers: Record<string, string>) {
  const roomName = `class-room-${Math.floor(Math.random() * 20) + 1}`;
  
  const res = http.post(
    `${BASE_URL}/classes/join`,
    JSON.stringify({
      roomName,
      organizationId: 'org-1',
    }),
    { headers, tags: { name: 'joinClass' } }
  );
  
  const latency = apiLatency.add(res.timings.duration);
  errorRate.add(res.status !== 200 && res.status !== 403);
  
  check(res, {
    'join class returns jitsi room': (r) => r.status === 200 || r.status === 403,
  });
  
  if (res.status === 200) {
    const jitsiToken = res.json('jitsiToken');
    const webrtcRes = http.get(
      `wss://jitsi.example.com/xmpp-websocket`,
      { tags: { name: 'webrtcSignaling' } }
    );
  }
  
  sleep(10);
}

export function handleSummary(data: {
  metrics: Record<string, { values: { p(95): number; avg: number; count: number } }>;
}) {
  return {
    stdout: textSummary(data),
    'load-test-results.json': JSON.stringify(data),
  };
}

function textSummary(data: {
  metrics: Record<string, { values: { p(95): number; avg: number; count: number } };
}): string {
  const { api_latency, page_load_latency, errors } = data.metrics;
  
  return `
    Load Test Results
    =================
    API Latency p(95): ${api_latency?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms
    Page Load p(95): ${page_load_latency?.values?.['p(95)']?.toFixed(2) || 'N/A'}ms
    Error Rate: ${((errors?.values?.rate || 0) * 100).toFixed(2)}%
  `;
}
