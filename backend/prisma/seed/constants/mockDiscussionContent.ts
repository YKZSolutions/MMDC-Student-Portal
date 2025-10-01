export const mockMainDiscussionContent = [
  {
    id: '100-main-discussion',
    type: 'paragraph',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'This is the main discussion topic.',
        styles: {},
      },
    ],
    children: [],
  },
];

export const mockReplyDiscussionContent = [
  {
    id: '100-reply-discussion',
    type: 'paragraph',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'This is a reply to the main discussion topic.',
        styles: {},
      },
    ],
    children: [],
  },
];
