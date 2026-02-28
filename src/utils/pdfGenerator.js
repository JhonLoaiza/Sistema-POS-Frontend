import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrencyCLP } from './formatters';

export const generarReporteDiarioPDF = (datos, fecha) => {
    const doc = new jsPDF();
    
    // Configuración de colores
    const colorPrimario = [41, 128, 185];
    const colorSecundario = [52, 73, 94];
    const colorExito = [39, 174, 96];
    const colorPeligro = [231, 76, 60];
    
    // Encabezado
    doc.setFillColor(...colorPrimario);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('SmartPOS', 105, 15, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'normal');
    doc.text('Reporte Diario de Ventas', 105, 25, { align: 'center' });
    
    doc.setFontSize(12);
    const fechaFormateada = new Date(fecha + 'T00:00:00').toLocaleDateString('es-CL', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    doc.text(`Fecha: ${fechaFormateada}`, 105, 33, { align: 'center' });
    
    // Resetear color de texto
    doc.setTextColor(0, 0, 0);
    
    let yPos = 50;
    
    // Sección 1: Resumen Financiero
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...colorSecundario);
    doc.text('Resumen Financiero', 14, yPos);
    yPos += 10;
    
    // Tabla de resumen
    autoTable(doc, {
        startY: yPos,
        head: [['Concepto', 'Monto']],
        body: [
            ['Ventas Totales', formatCurrencyCLP(datos.total_ventas)],
            ['Ganancia Bruta', formatCurrencyCLP(datos.ganancia_bruta)],
            ['Flujo de Caja Neto', formatCurrencyCLP(datos.flujo_caja_neto)]
        ],
        theme: 'grid',
        headStyles: { 
            fillColor: colorPrimario,
            fontSize: 11,
            fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 10 },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 80, halign: 'right', fontStyle: 'bold' }
        }
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
    
    // Sección 2: Egresos
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...colorPeligro);
    doc.text('Egresos del Día', 14, yPos);
    yPos += 10;
    
    autoTable(doc, {
        startY: yPos,
        head: [['Tipo de Egreso', 'Monto']],
        body: [
            ['Compras de Productos', formatCurrencyCLP(datos.compras)],
            ['Gastos y Retiros', formatCurrencyCLP(datos.gastos)],
            ['Mermas (' + datos.mermas.cantidad + ' unidades)', formatCurrencyCLP(datos.mermas.valor)],
            ['Total Egresos', formatCurrencyCLP(datos.compras + datos.gastos + datos.mermas.valor)]
        ],
        theme: 'grid',
        headStyles: { 
            fillColor: colorPeligro,
            fontSize: 11,
            fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 10 },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 80, halign: 'right' }
        },
        didParseCell: function(data) {
            // Resaltar la última fila (Total)
            if (data.row.index === 3 && data.section === 'body') {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [245, 245, 245];
            }
        }
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
    
    // Sección 3: Desglose por Método de Pago
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...colorExito);
    doc.text('Desglose por Método de Pago', 14, yPos);
    yPos += 10;
    
    const bodyPagos = datos.resumen_pagos.length > 0 
        ? datos.resumen_pagos.map(pago => [
            pago.metodo_pago.charAt(0).toUpperCase() + pago.metodo_pago.slice(1),
            formatCurrencyCLP(pago.total_por_metodo)
          ])
        : [['Sin ventas registradas', '-']];
    
    autoTable(doc, {
        startY: yPos,
        head: [['Método de Pago', 'Total Recibido']],
        body: bodyPagos,
        theme: 'grid',
        headStyles: { 
            fillColor: colorExito,
            fontSize: 11,
            fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 10 },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 80, halign: 'right', fontStyle: 'bold' }
        }
    });
    
    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(128, 128, 128);
        doc.text(
            `Generado el ${new Date().toLocaleString('es-CL')}`,
            14,
            doc.internal.pageSize.height - 10
        );
        doc.text(
            `Página ${i} de ${pageCount}`,
            doc.internal.pageSize.width - 14,
            doc.internal.pageSize.height - 10,
            { align: 'right' }
        );
    }
    
    // Guardar el PDF
    const nombreArchivo = `Reporte_Diario_${fecha}.pdf`;
    doc.save(nombreArchivo);
};

export const generarCierreCajaPDF = (datos) => {
    const doc = new jsPDF();
    
    // Configuración de colores
    const colorPrimario = [41, 128, 185];
    const colorExito = [39, 174, 96];
    const colorPeligro = [231, 76, 60];
    const colorAdvertencia = [243, 156, 18];
    
    // Encabezado
    doc.setFillColor(...colorPrimario);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('SmartPOS', 105, 15, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'normal');
    doc.text('Cierre de Caja', 105, 25, { align: 'center' });
    
    doc.setFontSize(12);
    const fechaFormateada = new Date(datos.fecha + 'T00:00:00').toLocaleDateString('es-CL', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    doc.text(`Fecha: ${fechaFormateada}`, 105, 33, { align: 'center' });
    
    // Resetear color de texto
    doc.setTextColor(0, 0, 0);
    
    let yPos = 50;
    
    // Sección 1: Resultado del Cierre
    const diferencia = datos.diferencia || 0;
    const colorResultado = diferencia === 0 ? colorExito : (diferencia > 0 ? colorAdvertencia : colorPeligro);
    
    doc.setFillColor(...colorResultado);
    doc.roundedRect(14, yPos, 182, 30, 3, 3, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('RESULTADO DEL CIERRE', 105, yPos + 10, { align: 'center' });
    
    doc.setFontSize(20);
    let textoResultado = 'CUADRADO';
    if (diferencia > 0) textoResultado = `SOBRANTE: ${formatCurrencyCLP(Math.abs(diferencia))}`;
    if (diferencia < 0) textoResultado = `FALTANTE: ${formatCurrencyCLP(Math.abs(diferencia))}`;
    doc.text(textoResultado, 105, yPos + 22, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    yPos += 40;
    
    // Sección 2: Conteo de Efectivo
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Conteo de Efectivo', 14, yPos);
    yPos += 10;
    
    autoTable(doc, {
        startY: yPos,
        head: [['Concepto', 'Monto']],
        body: [
            ['Efectivo Esperado (Sistema)', formatCurrencyCLP(datos.efectivo_esperado)],
            ['Efectivo Real (Contado)', formatCurrencyCLP(datos.efectivo_real)],
            ['Diferencia', formatCurrencyCLP(diferencia)]
        ],
        theme: 'grid',
        headStyles: { 
            fillColor: colorPrimario,
            fontSize: 11,
            fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 10 },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 80, halign: 'right', fontStyle: 'bold' }
        },
        didParseCell: function(data) {
            // Resaltar la última fila (Diferencia)
            if (data.row.index === 2 && data.section === 'body') {
                if (diferencia === 0) {
                    data.cell.styles.fillColor = [212, 237, 218];
                    data.cell.styles.textColor = [21, 87, 36];
                } else if (diferencia > 0) {
                    data.cell.styles.fillColor = [255, 243, 205];
                    data.cell.styles.textColor = [133, 100, 4];
                } else {
                    data.cell.styles.fillColor = [248, 215, 218];
                    data.cell.styles.textColor = [114, 28, 36];
                }
            }
        }
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
    
    // Sección 3: Resumen de Ventas
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...colorExito);
    doc.text('Resumen de Ventas', 14, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 10;
    
    autoTable(doc, {
        startY: yPos,
        head: [['Método de Pago', 'Total']],
        body: [
            ['Efectivo', formatCurrencyCLP(datos.efectivo_ventas)],
            ['Tarjeta', formatCurrencyCLP(datos.tarjeta)],
            ['Transferencia', formatCurrencyCLP(datos.transferencia)],
            ['TOTAL VENTAS', formatCurrencyCLP(datos.total_ventas)]
        ],
        theme: 'grid',
        headStyles: { 
            fillColor: colorExito,
            fontSize: 11,
            fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 10 },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 80, halign: 'right' }
        },
        didParseCell: function(data) {
            // Resaltar la última fila (Total)
            if (data.row.index === 3 && data.section === 'body') {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [245, 245, 245];
            }
        }
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
    
    // Sección 4: Gastos
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...colorPeligro);
    doc.text('Gastos y Retiros', 14, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 10;
    
    autoTable(doc, {
        startY: yPos,
        head: [['Concepto', 'Monto']],
        body: [
            ['Total Gastos del Día', formatCurrencyCLP(datos.total_gastos)]
        ],
        theme: 'grid',
        headStyles: { 
            fillColor: colorPeligro,
            fontSize: 11,
            fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 10 },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 80, halign: 'right', fontStyle: 'bold' }
        }
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
    
    // Sección 5: Observaciones (si existen)
    if (datos.observaciones && datos.observaciones.trim() !== '') {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Observaciones', 14, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const observacionesLineas = doc.splitTextToSize(datos.observaciones, 180);
        doc.text(observacionesLineas, 14, yPos);
        yPos += (observacionesLineas.length * 5) + 10;
    }
    
    // Firma
    yPos = Math.max(yPos, 240);
    doc.setDrawColor(0, 0, 0);
    doc.line(14, yPos, 90, yPos);
    doc.setFontSize(10);
    doc.text('Firma del Responsable', 52, yPos + 7, { align: 'center' });
    
    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(128, 128, 128);
        doc.text(
            `Generado el ${new Date().toLocaleString('es-CL')}`,
            14,
            doc.internal.pageSize.height - 10
        );
        doc.text(
            `Página ${i} de ${pageCount}`,
            doc.internal.pageSize.width - 14,
            doc.internal.pageSize.height - 10,
            { align: 'right' }
        );
    }
    
    // Guardar el PDF
    const nombreArchivo = `Cierre_Caja_${datos.fecha}.pdf`;
    doc.save(nombreArchivo);
};
