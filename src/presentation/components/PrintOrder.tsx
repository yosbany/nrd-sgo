import React from 'react';

interface OrderItem {
  quantity: number;
  unit: string;
  description: string;
}

interface PrintOrderProps {
  orderNumber: string;
  date: Date;
  contactType: 'proveedor' | 'cliente' | 'empleado';
  contactName: string;
  items: OrderItem[];
}

const styles = {
  printContainer: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    width: '80mm',
    margin: 0,
    padding: '10px',
    fontWeight: 'bold',
  },
  ticket: {
    textAlign: 'left' as const,
    fontWeight: 'bold',
  },
  orderNumber: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
  },
  date: {
    margin: '5px 0',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  businessName: {
    margin: 0,
    fontSize: '12px',
    textAlign: 'left' as const,
    fontWeight: 'bold',
  },
  contact: {
    fontSize: '12px',
    margin: '5px 0',
    fontWeight: 'bold',
  },
  line: {
    borderTop: '1px dashed black',
    margin: '5px 0',
  },
  itemsTable: {
    width: '100%',
    textAlign: 'left' as const,
    tableLayout: 'auto' as const,
  },
  checkbox: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    border: '1px solid black',
    marginRight: '6px',
    marginTop: '8px',
  },
  itemRow: {
    display: 'flex' as const,
    alignItems: 'flex-start' as const,
    width: '100%',
  },
  itemQuantity: {
    padding: '5px',
    paddingRight: '15px',
    fontSize: '14px',
    whiteSpace: 'nowrap' as const,
    fontWeight: 'bold',
  },
  itemDescription: {
    padding: '5px',
    paddingLeft: '0',
    fontSize: '14px',
    flex: 1,
    wordWrap: 'break-word' as const,
    fontWeight: 'bold',
  },
  totals: {
    fontSize: '14px',
    margin: '5px 0',
    fontWeight: 'bold',
  },
  spacer: {
    height: '30px',
  },
};

export const PrintOrder: React.FC<PrintOrderProps> = ({
  orderNumber,
  date,
  contactType,
  contactName,
  items,
}) => {
  const totalProducts = items.length;
  const totalItems = Number(items.reduce((sum, item) => sum + item.quantity, 0));

  return (
    <div style={styles.printContainer}>
      <div style={styles.ticket}>
        <h2 style={styles.orderNumber}>Orden N°: {orderNumber}</h2>
        <p style={styles.date}>
          Fecha: {date.toLocaleDateString()}
        </p>
        <h1 style={styles.businessName}>TEJAS DE LA CRUZ YOSBANY</h1>
        <p style={styles.contact}>
          {contactType.toUpperCase()}: <strong>{contactName}</strong>
        </p>
        <div style={styles.line} />
        <table style={styles.itemsTable}>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td colSpan={2}>
                  <div style={styles.itemRow}>
                    <div style={styles.checkbox} />
                    <div style={styles.itemQuantity}>
                      {item.quantity} {item.unit}
                    </div>
                    <div style={styles.itemDescription}>
                      {item.description}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={styles.line} />
        <p style={styles.totals}>
          Totales (Productos/ Items): {totalProducts} / {totalItems}
        </p>
        <div style={styles.spacer} />
      </div>
    </div>
  );
};

// Componente de ejemplo de uso
export const PrintOrderExample: React.FC = () => {
  const sampleData = {
    orderNumber: '1234',
    date: new Date(),
    contactType: 'proveedor' as const,
    contactName: 'Proveedor XYZ',
    items: [
      {
        quantity: 2,
        unit: 'Bolsas',
        description: 'Harina de trigo 50kg para panificación especial',
      },
      {
        quantity: 5,
        unit: 'Paquetes',
        description: 'Levadura seca instantánea 1kg de alta calidad',
      },
    ],
  };

  return <PrintOrder {...sampleData} />;
}; 