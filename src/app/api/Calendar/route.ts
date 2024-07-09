import type { NextApiRequest, NextApiResponse } from 'next';

type Event = {
  title: string;
  start: string;
  end: string;
  allDay: boolean;
};

const events: Event[] = [
  {
    title: 'Sample Event',
    start: new Date().toISOString(),
    end: new Date().toISOString(),
    allDay: false,
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(events);
}
