import { Grid, Group, Text, Input } from "@mantine/core";
import { IconCategory } from "@tabler/icons-react";

interface FormRowProps {
  icon?: React.ReactNode;
  label: string;
  placeholder?: string;
}

export default function FormRow({ icon = <IconCategory />, label, placeholder = "Empty" }: FormRowProps) {
  return (
    <Group>
      <Group gap="xs" h="100%" align="center" w="125">
        {icon}
        <Text>{label}</Text>
      </Group>
      <Input
        variant="unstyled"
        placeholder={placeholder}
        fw={400}
        size="md"
      />
    </Group>
  );
}
