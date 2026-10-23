import { Grid, Stack } from "@butteryui/core";
import { useState } from "react";
import {
  AppPage,
  Breadcrumbs,
  ArrowLink,
  DataTable,
  EmptyState,
  GroupedList,
  InitialsTile,
  MetricCard,
  PageHeader,
  RecommendationCard,
  StatusBadge,
  Tabs,
  toast,
} from "@butteryui/react";
import type { DataTableColumn } from "@butteryui/react";
import { Mail, Repeat, UserX } from "lucide-react";
import type { ReactElement } from "react";
import { CUSTOMER_ROWS } from "./customers.ts";
import { SUBSCRIPTIONS, TODAY, coffeeOf, dayNumber } from "./data.ts";
import type { Order } from "./data.ts";
import { dateTime, money, number, shortDate, since } from "./format.ts";
import { PageFooter } from "./page-footer.tsx";
import { useLink, useNavigate } from "./router.tsx";

const ORDERS_PAGE = 25;

const ORDER_COLUMNS: readonly DataTableColumn<Order>[] = [
  {
    id: "order",
    header: "Order",
    cell: (order) => <DataTable.Id value={order.id} />,
    minWidth: "md",
  },
  {
    id: "coffee",
    header: "Coffee",
    cell: (order) => coffeeOf(order.coffeeId).name,
    minWidth: "md",
    grow: 2,
  },
  {
    id: "bags",
    header: "Bags",
    cell: (order) => order.bags,
    minWidth: "xs",
    align: "end",
  },
  {
    id: "amount",
    header: "Amount",
    cell: (order) => <DataTable.Amount value={order.amount} currency="USD" />,
    minWidth: "md",
    align: "end",
  },
  {
    id: "placed",
    header: "Placed",
    cell: (order) => dateTime(order.placed),
    minWidth: "md",
  },
];

/** One customer: what they've bought, their subscriptions, and their details in the rail. */
export function CustomerPage({ id }: { readonly id: string }): ReactElement {
  const link = useLink();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const customer = CUSTOMER_ROWS.find((row) => row.id === id);
  if (customer === undefined)
    return (
      <AppPage
        footer={<PageFooter />}
        header={
          <PageHeader
            title="Customer"
            breadcrumbs={
              <Breadcrumbs
                items={[{ label: "Customers", href: link("/customers") }]}
              />
            }
          />
        }
      >
        <EmptyState
          icon={UserX}
          title="This customer isn't here"
          description="They may have been removed, or the link is from somewhere else."
          docs={<ArrowLink href={link("/customers")}>All customers</ArrowLink>}
        />
      </AppPage>
    );
  const subscriptions = SUBSCRIPTIONS.filter(
    (subscription) => subscription.customerId === customer.id,
  );
  const lately = customer.orders.filter(
    (order) => dayNumber(TODAY) - dayNumber(order.placed) < 56,
  ).length;
  const average =
    customer.orders.length === 0 ? 0 : customer.spent / customer.orders.length;
  return (
    <Tabs defaultValue="overview">
      <AppPage
        footer={<PageFooter />}
        header={
          <PageHeader
            title={customer.name}
            breadcrumbs={
              <Breadcrumbs
                items={[{ label: "Customers", href: link("/customers") }]}
              />
            }
            description={`${customer.email}, ${customer.city}`}
            actions={
              <PageHeader.Action
                label="Email"
                icon={Mail}
                onSelect={() => {
                  toast(`Drafted an email to ${customer.email}`);
                }}
              />
            }
          >
            <Tabs.List label="Customer">
              <Tabs.Tab value="overview">Overview</Tabs.Tab>
              <Tabs.Tab value="orders">Orders</Tabs.Tab>
              <Tabs.Tab value="subscriptions">Subscriptions</Tabs.Tab>
            </Tabs.List>
          </PageHeader>
        }
        asideLabel="Customer details"
        aside={
          <>
            <AppPage.Section title="Details">
              <GroupedList>
                <GroupedList.Group title="Contact">
                  <GroupedList.Item
                    title="Email"
                    description={customer.email}
                  />
                  <GroupedList.Item title="City" value={customer.city} />
                </GroupedList.Group>
                <GroupedList.Group title="Account">
                  <GroupedList.Item
                    title="Type"
                    value={
                      <StatusBadge
                        tone={
                          customer.kind === "wholesale" ? "info" : "neutral"
                        }
                      >
                        {customer.kind === "wholesale" ? "Wholesale" : "Retail"}
                      </StatusBadge>
                    }
                  />
                  <GroupedList.Item
                    title="Customer since"
                    value={since(customer.since)}
                  />
                </GroupedList.Group>
              </GroupedList>
            </AppPage.Section>
            {customer.kind === "retail" && !customer.subscribed ? (
              <AppPage.Section>
                <RecommendationCard
                  title="Offer a subscription"
                  badge="Suggested"
                  action={{
                    label: "Send an offer",
                    onClick: () => toast(`Offer sent to ${customer.name}`),
                  }}
                >
                  {`${customer.name.split(" ")[0] ?? customer.name} has ordered ${lately === 1 ? "once" : `${number(lately)} times`} in the last eight weeks.`}
                </RecommendationCard>
              </AppPage.Section>
            ) : null}
          </>
        }
      >
        <Tabs.Panel value="overview">
          <Stack gap={8}>
            <AppPage.Section title="At a glance">
              <Grid columns={{ base: 1, md: 3 }} gap={4}>
                <MetricCard title="Spent" value={money(customer.spent)} />
                <MetricCard
                  title="Orders"
                  value={number(customer.orders.length)}
                />
                <MetricCard title="Average order" value={money(average)} />
              </Grid>
            </AppPage.Section>
            <AppPage.Section title="Recent orders">
              <DataTable<Order>
                label="Recent orders"
                size="compact"
                columns={ORDER_COLUMNS}
                rows={customer.orders.slice(0, 5)}
                rowKey={(order) => order.id}
                empty={
                  <EmptyState
                    title="No orders yet"
                    description="Their first order will show here."
                  />
                }
              />
            </AppPage.Section>
          </Stack>
        </Tabs.Panel>
        <Tabs.Panel value="orders">
          <AppPage.Section>
            <DataTable<Order>
              label="Orders"
              columns={ORDER_COLUMNS}
              rows={customer.orders.slice(
                (page - 1) * ORDERS_PAGE,
                page * ORDERS_PAGE,
              )}
              rowKey={(order) => order.id}
              pagination={{
                page,
                pageSize: ORDERS_PAGE,
                total: customer.orders.length,
                onPageChange: setPage,
              }}
              empty={
                <EmptyState
                  title="No orders yet"
                  description="Their first order will show here."
                />
              }
            />
          </AppPage.Section>
        </Tabs.Panel>
        <Tabs.Panel value="subscriptions">
          <AppPage.Section>
            {subscriptions.length === 0 ? (
              <EmptyState
                icon={Repeat}
                title="No subscriptions"
                description="Coffee on a schedule shows up here once they start one."
                docs={
                  <ArrowLink href={link("/subscriptions")}>
                    All subscriptions
                  </ArrowLink>
                }
              />
            ) : (
              <GroupedList>
                <GroupedList.Group title="Subscriptions">
                  {subscriptions.map((subscription) => {
                    const coffee = coffeeOf(subscription.coffeeId);
                    return (
                      <GroupedList.Item
                        key={subscription.id}
                        title={`${coffee.name}, every ${subscription.every}`}
                        description={
                          subscription.next === null
                            ? subscription.status === "paused"
                              ? "Paused"
                              : "Cancelled"
                            : `Next on ${shortDate(subscription.next)}`
                        }
                        media={
                          <InitialsTile
                            name={`${coffee.name} ${coffee.origin}`}
                            size="md"
                          />
                        }
                        value={`${String(subscription.bags)} ${subscription.bags === 1 ? "bag" : "bags"}`}
                        onClick={() => {
                          navigate("/subscriptions");
                        }}
                      />
                    );
                  })}
                </GroupedList.Group>
              </GroupedList>
            )}
          </AppPage.Section>
        </Tabs.Panel>
      </AppPage>
    </Tabs>
  );
}
