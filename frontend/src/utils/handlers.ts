const handleMeetingClick = (meetingLink?: string | undefined) => {
  if (meetingLink) {
    window.open(meetingLink, '_blank', 'noopener,noreferrer')
  }
}

export { handleMeetingClick}