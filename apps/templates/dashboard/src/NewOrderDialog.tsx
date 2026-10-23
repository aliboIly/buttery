import { useState } from "react";
import type { ReactElement } from "react";
import { FormDialog, NumberField, TextField } from "@butteryui/react";

/** What a new order needs: who it's for, what they bought and what it cost. */
export interface NewOrder {
  readonly customer: string;
  readonly item: string;
  readonly amount: number;
}

/** The dialog the top bar's New order opens, which adds an order once its three fields are filled in. */
export function NewOrderDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onAdd: (order: NewOrder) => void;
}): ReactElement {
  const [customer, setCustomer] = useState("");
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState(0);
  return (
    <FormDialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (next) return;
        setCustomer("");
        setItem("");
        setAmount(0);
      }}
      title="New order"
      description="It starts as unpaid, until the customer pays."
      valid={customer.trim() !== "" && item.trim() !== "" && amount > 0}
      onSubmit={() => {
        onAdd({ customer: customer.trim(), item: item.trim(), amount });
      }}
      submitLabel="Add order"
    >
      <TextField
        label="Customer"
        value={customer}
        onValueChange={setCustomer}
      />
      <TextField label="Item" value={item} onValueChange={setItem} />
      <NumberField
        label="Amount"
        labelPosition="top"
        unit="USD"
        min={0}
        max={100000}
        value={amount}
        onValueChange={setAmount}
      />
    </FormDialog>
  );
}
