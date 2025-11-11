import React from "react";

const InvoicePDFTemplate = React.forwardRef(({ invoice }, ref) => {
  if (!invoice) return null;

  // Compute totals
  const netTotal = invoice.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const vatTotal = invoice.items.reduce(
    (sum, item) => sum + (item.unitPrice * item.vatRate * item.quantity) / 100,
    0
  );
  const grandTotal = netTotal + vatTotal;

  return (
    <div
      ref={ref}
      id="invoice-pdf"
      className="bg-white p-8 text-black text-sm"
      style={{ width: "794px", margin: "0 auto", display: "none" }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col">
          <img src="/logo.png" alt="Company Logo" className="w-32 mb-2" />
          <h2 className="font-bold text-lg">VESTIAIRE ST. HONORÉ</h2>
          <p>
            229 Rue Saint-Honoré
            <br />
            75001 Paris, France
            <br />
            VAT: FR401234444
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold">Receiver :</p>
          <p>
            {invoice.customerName} <br />
            {invoice.customerCompany} <br />
            {invoice.customerCountry}
          </p>
        </div>
      </div>

      {/* Invoice Meta */}
      <div className="mb-6">
        <p>
          <strong>Invoice No :</strong> {invoice.invoiceNo}
        </p>
        <p>
          <strong>Date :</strong> {invoice.date}
        </p>
        <p>
          <strong>VAT Regime :</strong> {invoice.vatRegime}
        </p>
        <p>
          <strong>Customer VAT :</strong> {invoice.vatNo || "N/A"}
        </p>
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse text-sm mb-6">
        <thead>
          <tr className="bg-gray-100 border-y">
            <th className="text-left p-2">Description</th>
            <th className="text-right p-2">Quantity</th>
            <th className="text-right p-2">Unit Price</th>
            <th className="text-right p-2">VAT</th>
            <th className="text-right p-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={idx} className="border-b">
              <td className="p-2">{item.description}</td>
              <td className=" text-right p-2">{item.quantity}</td>
              <td className="text-right p-2">
                {item.unitPrice.toLocaleString()} €
              </td>
              <td className="text-right p-2">{item.vatRate}%</td>
              <td className="text-right p-2">
                {(item.quantity * item.unitPrice).toLocaleString()} €
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bank + Totals Section */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="border p-3 rounded">
          <h3 className="font-semibold text-blue-700 mb-2">Bank Details</h3>
          <p>
            <strong>Bank:</strong> {invoice.bankDetails.bank}
          </p>
          <p>
            <strong>Account Number:</strong> {invoice.bankDetails.accountNumber}
          </p>
          <p>
            <strong>Account Type:</strong> {invoice.bankDetails.accountType}
          </p>
          <p>
            <strong>Currency:</strong> {invoice.bankDetails.currency}
          </p>
          <p>
            <strong>Payment Reference:</strong> {invoice.bankDetails.reference}
          </p>
        </div>

        <div className="border p-3 rounded">
          <div className="flex justify-between">
            <span>Net amount</span>
            <span>{netTotal.toLocaleString()} €</span>
          </div>
          <div className="flex justify-between">
            <span>VAT</span>
            <span>{vatTotal.toLocaleString()} €</span>
          </div>
          <div className="flex justify-between items-center bg-blue-900 text-white font-semibold h-10 pb-2 px-2 mt-3 rounded-md">
            <p className=" inline-flex justify-center items-center">Total</p>
            <p className="inline-flex  justify-center items-center">
              {grandTotal.toLocaleString()} €
            </p>
          </div>

          <div className="flex justify-between mt-1">
            <span>Amount Due</span>
            <span>0.00 €</span>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <p className="text-xs mt-40 leading-relaxed text-justify">
        No discount will be granted for early settlement. Any late payment shall
        automatically give rise to a penalty calculated at three times the
        statutory interest rate (Article L 441-10, paragraph 12 of the French
        Commercial Code). In addition, for any business customer, any amount not
        paid on its due date shall automatically incur a fixed recovery charge
        of €40 pursuant to Articles L 441-6, I, paragraph 12 and D 441-5 of the
        French Commercial Code.
      </p>

      <p className="text-center text-xs mt-4 font-medium">
        VESTIAIRE SAINT-HONORÉ SAS — Share capital of 10,000€ — Company No
        94479826000016
      </p>
    </div>
  );
});

export default InvoicePDFTemplate;
