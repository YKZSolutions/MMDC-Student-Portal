import {
  Button,
  Group,
  NumberFormatter,
  Paper,
  Table,
  rem,
} from '@mantine/core'
import { IconHistory } from '@tabler/icons-react'
import Decimal from 'decimal.js'
import { groupBy } from 'lodash'
import React from 'react'
import type { IFrontendBillingCostBreakdown } from './types'

function BillingFeeBreakdown({
  open,
  fees,
}: {
  open?: () => void
  fees: IFrontendBillingCostBreakdown[]
}) {
  // group by category
  const grouped = groupBy(fees, 'category')

  const totalNumber = (Array.isArray(fees) ? fees : []).reduce(
    (sum, item) => sum.plus(new Decimal(item?.cost ?? 0)),
    new Decimal(0),
  )

  const total = totalNumber.toNumber()

  return (
    <Paper radius="md" withBorder>
      <Table
        verticalSpacing="md"
        highlightOnHover
        highlightOnHoverColor="gray.0"
      >
        {Object.entries(grouped).map(([category, items]) => (
          <React.Fragment key={category}>
            <Table.Thead>
              <Table.Tr bg="gray.1" c="dark.7">
                <Table.Th>{category}</Table.Th>
                <Table.Th>
                  {open && (
                    <Group w="100%">
                      <Button
                        size="xs"
                        ml="auto"
                        variant="outline"
                        radius="md"
                        leftSection={<IconHistory size={20} />}
                        c="gray.7"
                        color="gray.4"
                        lts={rem(0.25)}
                        onClick={open}
                      >
                        History
                      </Button>
                    </Group>
                  )}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {items.map((item) => (
                <Table.Tr key={item.id || crypto.randomUUID()}>
                  <Table.Td>{item.name}</Table.Td>
                  <Table.Td style={{ textAlign: 'end' }}>
                    <NumberFormatter
                      prefix="₱ "
                      value={item.cost}
                      thousandSeparator
                    />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </React.Fragment>
        ))}

        {/* total row */}
        <Table.Tbody>
          <Table.Tr bg="gray.1" c="dark.7">
            <Table.Th>Total</Table.Th>
            <Table.Th style={{ textAlign: 'end' }}>
              <NumberFormatter prefix="₱ " value={total} thousandSeparator />
            </Table.Th>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Paper>
  )
}

export default BillingFeeBreakdown
