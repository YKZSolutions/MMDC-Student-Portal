import { Box, Container, Group, Stack, Title, Text } from '@mantine/core'

const CoursesAdminPage = () => {
    return (
        <Container fluid m={0} bg={'gray.0'}>
            <Stack gap={'xl'}>
                {/* Page Hero */}
                <Group justify="space-between" align="start">
                    <Box pb={'xl'}>
                        <Title c={'dark.7'} variant="hero" order={2} fw={700}>
                            Courses
                        </Title>
                        <Text c={'dark.3'} fw={500}>
                            Manage users and their account permissions here.
                        </Text>
                    </Box>
                </Group>
            </Stack>
        </Container>
    );
};

export default CoursesAdminPage;