/**
 * Quantaly Enterprise Google Workspace Service Integration Logic
 * Provides clean, type-safe underlying API functions for all 12 Google Workspace services.
 */

import { getCachedAccessToken } from './firebase';

export interface WorkspaceApiOptions {
  accessToken?: string;
}

const getAuthHeader = (options?: WorkspaceApiOptions) => {
  const token = options?.accessToken || getCachedAccessToken();
  if (!token) {
    throw new Error('Google Workspace Access Token non disponibile. Effettua il login con Google.');
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// 1. Google Drive API
export const driveService = {
  async listFiles(query = '', pageSize = 20, options?: WorkspaceApiOptions) {
    const headers = getAuthHeader(options);
    const q = query ? `&q=${encodeURIComponent(query)}` : '';
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?pageSize=${pageSize}${q}&fields=files(id,name,mimeType,webViewLink,iconLink,createdTime,modifiedTime)`, { headers });
    if (!res.ok) throw new Error(`Drive API Error: ${res.statusText}`);
    return res.json();
  },

  async getFileMetadata(fileId: string, options?: WorkspaceApiOptions) {
    const headers = getAuthHeader(options);
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,webViewLink,size,createdTime`, { headers });
    if (!res.ok) throw new Error(`Drive File Error: ${res.statusText}`);
    return res.json();
  }
};

// 2. Gmail API
export const gmailService = {
  async listMessages(maxResults = 10, options?: WorkspaceApiOptions) {
    const headers = getAuthHeader(options);
    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`, { headers });
    if (!res.ok) throw new Error(`Gmail API Error: ${res.statusText}`);
    return res.json();
  },

  async getMessage(messageId: string, options?: WorkspaceApiOptions) {
    const headers = getAuthHeader(options);
    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`, { headers });
    if (!res.ok) throw new Error(`Gmail Message Error: ${res.statusText}`);
    return res.json();
  },

  async sendEmail(to: string, subject: string, bodyText: string, options?: WorkspaceApiOptions) {
    const headers = getAuthHeader(options);
    const emailLines = [
      `To: ${to}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${subject}`,
      '',
      bodyText,
    ];
    const rawEmail = btoa(unescape(encodeURIComponent(emailLines.join('\r\n'))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers,
      body: JSON.stringify({ raw: rawEmail }),
    });
    if (!res.ok) throw new Error(`Gmail Send Error: ${res.statusText}`);
    return res.json();
  }
};

// 3. Google Calendar API
export const calendarService = {
  async listEvents(timeMin = new Date().toISOString(), maxResults = 15, options?: WorkspaceApiOptions) {
    const headers = getAuthHeader(options);
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&maxResults=${maxResults}&orderBy=startTime&singleEvents=true`, { headers });
    if (!res.ok) throw new Error(`Calendar API Error: ${res.statusText}`);
    return res.json();
  },

  async createEvent(event: { summary: string; description?: string; start: { dateTime: string }; end: { dateTime: string } }, options?: WorkspaceApiOptions) {
    const headers = getAuthHeader(options);
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers,
      body: JSON.stringify(event),
    });
    if (!res.ok) throw new Error(`Calendar Create Event Error: ${res.statusText}`);
    return res.json();
  }
};

// 4. Google Docs API
export const docsService = {
  async getDocument(documentId: string, options?: WorkspaceApiOptions) {
    const headers = getAuthHeader(options);
    const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, { headers });
    if (!res.ok) throw new Error(`Docs API Error: ${res.statusText}`);
    return res.json();
  },

  async createDocument(title: string, options?: WorkspaceApiOptions) {
    const headers = getAuthHeader(options);
    const res = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers,
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error(`Docs Create Error: ${res.statusText}`);
    return res.json();
  }
};

// 5. Google Slides API
export const slidesService = {
  async getPresentation(presentationId: string, options?: WorkspaceApiOptions) {
    const headers = getAuthHeader(options);
    const res = await fetch(`https://slides.googleapis.com/v1/presentations/${presentationId}`, { headers });
    if (!res.ok) throw new Error(`Slides API Error: ${res.statusText}`);
    return res.json();
  },

  async createPresentation(title: string, options?: WorkspaceApiOptions) {
    const headers = getAuthHeader(options);
    const res = await fetch('https://slides.googleapis.com/v1/presentations', {
      method: 'POST',
      headers,
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error(`Slides Create Error: ${res.statusText}`);
    return res.json();
  }
};

// 6. Google Tasks API
export const tasksService = {
  async listTaskLists(options?: WorkspaceApiOptions) {
    const headers = getAuthHeader(options);
    const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@default/lists', { headers });
    if (!res.ok) throw new Error(`Tasks API Error: ${res.statusText}`);
    return res.json();
  },

  async listTasks(tasklistId = '@default', options?: WorkspaceApiOptions) {
    const headers = getAuthHeader(options);
    const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${tasklistId}/tasks`, { headers });
    if (!res.ok) throw new Error(`Tasks List Error: ${res.statusText}`);
    return res.json();
  },

  async createTask(tasklistId = '@default', title: string, notes?: string, options?: WorkspaceApiOptions) {
    const headers = getAuthHeader(options);
    const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${tasklistId}/tasks`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ title, notes }),
    });
    if (!res.ok) throw new Error(`Tasks Create Error: ${res.statusText}`);
    return res.json();
  }
};

// 7. Google Chat API
export const chatService = {
  async listSpaces(options?: WorkspaceApiOptions) {
    const headers = getAuthHeader(options);
    const res = await fetch('https://chat.googleapis.com/v1/spaces', { headers });
    if (!res.ok) throw new Error(`Chat API Error: ${res.statusText}`);
    return res.json();
  },

  async sendMessage(spaceName: string, text: string, options?: WorkspaceApiOptions) {
    const headers = getAuthHeader(options);
    const res = await fetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`Chat Send Message Error: ${res.statusText}`);
    return res.json();
  }
};

// 8. Google Forms API
export const formsService = {
  async getForm(formId: string, options?: WorkspaceApiOptions) {
    const headers = getAuthHeader(options);
    const res = await fetch(`https://forms.googleapis.com/v1/forms/${formId}`, { headers });
    if (!res.ok) throw new Error(`Forms API Error: ${res.statusText}`);
    return res.json();
  },

  async listResponses(formId: string, options?: WorkspaceApiOptions) {
    const headers = getAuthHeader(options);
    const res = await fetch(`https://forms.googleapis.com/v1/forms/${formId}/responses`, { headers });
    if (!res.ok) throw new Error(`Forms Responses Error: ${res.statusText}`);
    return res.json();
  }
};

// 9. Google Meet API
export const meetService = {
  async createSpace(options?: WorkspaceApiOptions) {
    const headers = getAuthHeader(options);
    const res = await fetch('https://meet.googleapis.com/v2/spaces', {
      method: 'POST',
      headers,
      body: JSON.stringify({ config: { accessType: 'OPEN' } }),
    });
    if (!res.ok) throw new Error(`Meet API Error: ${res.statusText}`);
    return res.json();
  }
};

// 10. Contacts / People API
export const contactsService = {
  async listContacts(pageSize = 30, options?: WorkspaceApiOptions) {
    const headers = getAuthHeader(options);
    const res = await fetch(`https://people.googleapis.com/v1/people/me/connections?pageSize=${pageSize}&personFields=names,emailAddresses,photos,phoneNumbers`, { headers });
    if (!res.ok) throw new Error(`Contacts API Error: ${res.statusText}`);
    return res.json();
  }
};

// 11. Google Picker API Helper
export const pickerService = {
  getPickerConfig(options?: WorkspaceApiOptions) {
    const token = options?.accessToken || getCachedAccessToken();
    return {
      token,
      developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '',
      viewId: 'DOCS',
    };
  }
};

// 12. Google Classroom API
export const classroomService = {
  async listCourses(pageSize = 20, options?: WorkspaceApiOptions) {
    const headers = getAuthHeader(options);
    const res = await fetch(`https://classroom.googleapis.com/v1/courses?pageSize=${pageSize}`, { headers });
    if (!res.ok) throw new Error(`Classroom API Error: ${res.statusText}`);
    return res.json();
  },

  async listCourseWork(courseId: string, options?: WorkspaceApiOptions) {
    const headers = getAuthHeader(options);
    const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, { headers });
    if (!res.ok) throw new Error(`Classroom CourseWork Error: ${res.statusText}`);
    return res.json();
  }
};
