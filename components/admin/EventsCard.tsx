import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventList } from "@/components/events/EventList";
import type { Event } from "@/lib/types";

interface EventsCardProps {
  events: Event[];
  loading: boolean;
}

export function EventsCard({ events, loading }: EventsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Все события</CardTitle>
      </CardHeader>
      <CardContent>
        <EventList events={events} loading={loading} />
      </CardContent>
    </Card>
  );
}

