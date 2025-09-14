export const mockContent = [
  {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    type: 'heading',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
      level: 1, // Represents an <h1> tag
      isToggleable: false,
    },
    content: [
      {
        type: 'text',
        text: 'Module 1: Introduction to Quantum Physics',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
    type: 'paragraph',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'Welcome to the fascinating world of quantum physics! This module provides a foundational understanding of the principles that govern the universe at the smallest scales. We will explore the counterintuitive concepts that challenge our classical understanding of reality.',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef12',
    type: 'heading',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
      level: 2, // Represents an <h2> tag
      isToggleable: false,
    },
    content: [
      {
        type: 'text',
        text: 'Learning Objectives',
        styles: {
          bold: true,
        },
      },
    ],
    children: [],
  },
  {
    id: 'd4e5f6a7-b8c9-0123-4567-890abcdef123',
    type: 'bulletListItem',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'Define the concept of wave-particle duality.',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: 'e5f6a7b8-c9d0-1234-5678-90abcdef1234',
    type: 'bulletListItem',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: "Explain Heisenberg's Uncertainty Principle.",
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: 'f6a7b8c9-d0e1-2345-6789-0abcdef12345',
    type: 'bulletListItem',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'Describe the significance of the Schrödinger equation.',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: 'g7b8c9d0-e1f2-3456-7890-abcdef123456',
    type: 'paragraph',
    props: {
      textColor: 'default',
      backgroundColor: 'default',
      textAlignment: 'left',
    },
    content: [
      {
        type: 'text',
        text: 'For more information, please visit the ',
        styles: {},
      },
      {
        type: 'link',
        href: 'https://www.example-course.com/quantum-physics',
        content: [
          {
            type: 'text',
            text: 'Official Course Page',
            styles: {},
          },
        ],
      },
      {
        type: 'text',
        text: '.',
        styles: {},
      },
    ],
    children: [],
  },
];
