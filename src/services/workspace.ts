/**
 * Google Workspace APIs service for Google Tasks and Google Chat
 * Uses client-side Bearer token authentication via Firebase Auth OAuth token.
 */

export interface GoogleTaskItem {
  id?: string;
  title: string;
  notes?: string;
  status?: 'needsAction' | 'completed';
  due?: string;
}

export interface GoogleChatSpace {
  name: string; // format: "spaces/SPACE_ID"
  displayName?: string;
  type?: string;
}

export async function fetchGoogleTasks(accessToken: string): Promise<GoogleTaskItem[]> {
  try {
    const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks?showCompleted=true&maxResults=50', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to fetch Google Tasks: ${res.status}`);
    }

    const data = await res.json();
    return data.items || [];
  } catch (error: any) {
    console.warn('fetchGoogleTasks notice:', error?.message || error);
    throw error;
  }
}

export async function createGoogleTask(
  accessToken: string,
  task: { title: string; notes?: string; due?: string }
): Promise<GoogleTaskItem> {
  try {
    const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: task.title,
        notes: task.notes || '',
        due: task.due ? new Date(task.due).toISOString() : undefined,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to create Google Task: ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    console.warn('createGoogleTask notice:', error?.message || error);
    throw error;
  }
}

export async function updateGoogleTaskStatus(
  accessToken: string,
  taskId: string,
  completed: boolean
): Promise<GoogleTaskItem> {
  try {
    const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: completed ? 'completed' : 'needsAction',
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to update Google Task: ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    console.warn('updateGoogleTaskStatus notice:', error?.message || error);
    throw error;
  }
}

export async function fetchGoogleChatSpaces(accessToken: string): Promise<GoogleChatSpace[]> {
  try {
    const res = await fetch('https://chat.googleapis.com/v1/spaces?pageSize=50', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      // Some accounts might not have Google Chat enabled or spaces created
      console.warn('fetchGoogleChatSpaces warning:', err);
      return [];
    }

    const data = await res.json();
    return data.spaces || [];
  } catch (error: any) {
    console.warn('fetchGoogleChatSpaces notice:', error?.message || error);
    return [];
  }
}

export async function sendGoogleChatMessage(
  accessToken: string,
  spaceName: string,
  text: string
): Promise<any> {
  try {
    const cleanSpaceName = spaceName.startsWith('spaces/') ? spaceName : `spaces/${spaceName}`;
    const res = await fetch(`https://chat.googleapis.com/v1/${cleanSpaceName}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to post Google Chat message: ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    console.warn('sendGoogleChatMessage notice:', error?.message || error);
    throw error;
  }
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  creator?: {
    email?: string;
    displayName?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  htmlLink?: string;
}

export async function fetchGoogleCalendarEvents(
  accessToken: string,
  timeMin?: string,
  timeMax?: string
): Promise<GoogleCalendarEvent[]> {
  try {
    const params = new URLSearchParams({
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '100',
    });
    if (timeMin) params.append('timeMin', timeMin);
    if (timeMax) params.append('timeMax', timeMax);

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to fetch Google Calendar events: ${res.status}`);
    }

    const data = await res.json();
    return data.items || [];
  } catch (error: any) {
    console.warn('fetchGoogleCalendarEvents notice:', error?.message || error);
    throw error;
  }
}

export async function createGoogleCalendarEvent(
  accessToken: string,
  event: {
    summary: string;
    description?: string;
    startDate: string;
    endDate: string;
  }
): Promise<GoogleCalendarEvent> {
  try {
    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: event.summary,
          description: event.description || '',
          start: {
            date: event.startDate,
          },
          end: {
            date: event.endDate,
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to create Google Calendar event: ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    console.warn('createGoogleCalendarEvent notice:', error?.message || error);
    throw error;
  }
}

