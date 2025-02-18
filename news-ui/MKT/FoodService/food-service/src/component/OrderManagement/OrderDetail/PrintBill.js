import dayjs from "dayjs";

const fillInvoiceTemplate = function fillInvoiceTemplate(template, data) {
    template = template.replace(/<h2>.*?<\/h2>/, `<h2>${data.restaurantName || 'NHÀ HÀNG AIO'}</h2>`);
    template = template.replace(/<p>15\/24.*?<\/p>/, `<p>${data.restaurantAddress || '15/24 Nguyễn Thị Căn - Phường Tân Thới Hiệp - Quận 12 - TP HCM'}</p>`);
    template = template.replace(/<p>ĐT:.*?<\/p>/, `<p>ĐT: ${data.restaurantPhone || '0123456789 - 0987654321'}</p>`);
    template = template.replace(/<p>Số HD:.*?<\/p>/, `<p>Số HD: ${data.receiptID}</p>`);
    template = template.replace(/<p>Bàn:.*?<\/p>/, `<p>Bàn: ${data.table}</p>`);
    template = template.replace(/<p>Nhân viên tạo:.*?<\/p>/, `<p>Nhân viên tạo: ${data.employeeID_Create}</p>`);
    template = template.replace(/<p>Ngày:.*?<\/p>/, `<p>Ngày: ${dayjs(data.timeCreate).format('DD/MM/YYYY')}</p>`);
    template = template.replace(/<p>Giờ vào:.*?<\/p>/, `<p>Giờ vào: ${dayjs(data.timeCreate).format('HH:mm')} - Giờ ra: ${dayjs(data.timePrintBill).format('HH:mm')}</p>`);

    const employeePrintBillInfo = `<p>Nhân viên in: ${data.employeeID_PrintBill}</p>`;
    template = template.replace(/<\/div>\s*<\/div>\s*<div data-rbd-draggable-context-id="1" data-rbd-draggable-id="items"/,
        `${employeePrintBillInfo}</div></div><div data-rbd-draggable-context-id="1" data-rbd-draggable-id="items"`);

    let itemsHtml = '';
    let index = 0;
    data.listOrder.forEach(order => {
        if (order.status !== -1) {
            // Tính tổng giá của các item trong order.listItem (nếu có)
            const listItemTotal = order.listItem ? order.listItem.reduce((total, item) => {
                return total + (item.price * item.quantity * order.quantity);
            }, 0) : 0;

            // Tính tổng giá cho order
            const orderTotal = order.price * order.quantity + listItemTotal;

            itemsHtml += `
                    <tr class="ant-table-row ant-table-row-level-0">
                        <td class="ant-table-cell order-column-1">${order.liteTitle}</td>
                        <td class="ant-table-cell order-column-2">${order.price.toLocaleString()}đ</td>
                        <td class="ant-table-cell order-column-3" rowspan="${order.listItem ? order.listItem.length + 1 : 1}">${order.quantity}</td>
                        <td class="ant-table-cell order-column-4" rowspan="${order.listItem ? order.listItem.length + 1 : 1}">${orderTotal.toLocaleString()}đ</td>
                    </tr>
                `;

            if (order.listItem && order.listItem.length > 0) {
                order.listItem.forEach(item => {
                    itemsHtml += `
                            <tr style="border-top: none;" class="ant-table-row ant-table-row-level-0">
                                <td class="ant-table-cell list-item " style="padding-left: 50px; font-style: italic; font-size: 0.8em;">${item.quantity} x ${item.liteTitle}</td>
                                <td class="ant-table-cell">${item.price.toLocaleString()}đ</td>
                            </tr>
                        `;
                    index++;
                });
            }
        }
    });

    // Thêm hàng tổng tiền
    itemsHtml += `
           <tr class="ant-table-row ant-table-row-level-0">
            <td class="ant-table-cell" colspan="3">Tổng tiền:</td>
            <td class="ant-table-cell order-column-4">${data.liteBill_FoodsPrice.toLocaleString()}đ</td>
        </tr>
        `;

    template = template.replace(/<tbody class="ant-table-tbody">([\s\S]*?)<\/tbody>/, `<tbody class="ant-table-tbody">${itemsHtml}</tbody>`);
    template = template.replace(/<strong>Tổng tiền món:.*?<\/strong>/, '');

    let servicesHtml = '';
    if (data.listServiceCharges && data.listServiceCharges.length > 0) {
        data.listServiceCharges.forEach(service => {
            let servicePrice = service.isPercent ?
                (data.liteBill_FoodsPrice * service.value / 100) :
                (service.value * service.quantity);
            servicesHtml += `
                <tr class="ant-table-row ant-table-row-level-0">
                  <td class="ant-table-cell service-column-1">${service.title}</td>
                  <td class="ant-table-cell service-column-2">${service.isPercent ? `${service.value}%` : `${service.value.toLocaleString()}đ`}</td>
                  <td class="ant-table-cell service-column-3">${service.quantity}</td>
                  <td class="ant-table-cell service-column-4">${servicePrice.toLocaleString()}đ</td>
                </tr>
              `;
        });
        servicesHtml += `
        <tr class="ant-table-row ant-table-row-level-0">
                    <td  class="ant-table-cell" colspan="3">Tổng tiền:</td>
                    <td class="ant-table-cell order-column-4" >${data.liteBill_FoodsServiceChargePrice.toLocaleString()}</td>
                </tr>
        `
        const servicesRegex = /<h4>Phí dịch vụ<\/h4>[\s\S]*?<tbody class="ant-table-tbody">([\s\S]*?)<\/tbody>/;
        template = template.replace(/<tbody class="ant-table-tbody">([\s\S]*?)<\/tbody>/, `<tbody class="ant-table-tbody invoice-table">${itemsHtml}</tbody>`);
        template = template.replace(servicesRegex, `
                                                    <div class="ant-table-wrapper">
                                                        <div class="ant-spin-nested-loading">
                                                        <div class="ant-spin-container">
                                                            <div class="ant-table">
                                                            <div class="ant-table-container">
                                                                <div class="ant-table-content">
                                                                <table class="invoice-table">
                                                                    <thead class="ant-table-thead">
                                                                    <tr class="ant-table-row ant-table-row-level-0">
                                                                        <th class="ant-table-cell service-column-1">Tên dịch vụ</th>
                                                                        <th class="ant-table-cell service-column-2">Đơn Giá</th>
                                                                        <th class="ant-table-cell service-column-3">SL</th>
                                                                        <th class="ant-table-cell service-column-4">Thành Tiền</th>
                                                                    </tr>
                                                                    </thead>
                                                                    <tbody class="ant-table-tbody">${servicesHtml}</tbody>
                                                                </table>
                                                                </div>
                                                            </div>
                                                            </div>
                                                            <strong style="display: flex; justify-content: flex-end; margin-top: 10px;">Tổng tiền: ${data.liteBill_Subtotal.toLocaleString()}đ</strong>
                                                        </div>
                                                        </div>
                                                    </div>`);
    } else {
        template = template.replace(/<h4>Phí dịch vụ<\/h4>[\s\S]*?<\/div><\/div><\/div><\/div><\/div><\/div>/, '');
        template = template.replace(/<div[^>]*data-rbd-draggable-id="services"[^>]*>.*?<\/div>/s, ``);
    }
    template = template.replace(/<strong>Tổng tiền dịch vụ:.*?<\/strong>/, '');
    template = template.replace(/<h4>Tổng cộng:.*?<\/h4>/, `<h4 style="text-align: center;">Tổng cộng: ${data.liteBill_Total.toLocaleString()}đ</h4>`);

    const externalBillsRegex = /<div data-rbd-draggable-context-id="\d+" data-rbd-draggable-id="externalBills"[\s\S]*?<\/div>\s*<\/div>/;

    template = template.replace(externalBillsRegex, '');



    const logoRegex = /<div data-rbd-draggable-context-id="\d+" data-rbd-draggable-id="logo"[\s\S]*?<\/div>\s*<\/div>/;
    const logo = document.querySelector("body > div:nth-child(5) > div > img")
    if (logo) {
        template = template.replace(logoRegex, '');
    }


    if (data.listExternalBills && data.listExternalBills.length > 0) {
        let externalBillsHtml = '';
        let totalExternalBill = 0;

        data.listExternalBills.forEach(bill => {
            externalBillsHtml += `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${bill.title} ${bill.isPercent ? `(${bill.value}%)` : ''}</span>
                <span>${bill.payableAmount.toLocaleString()}đ</span>
            </div>
        `;
            totalExternalBill += bill.payableAmount;
        });

        const externalBillsSection = `
        <div data-rbd-draggable-context-id="1" data-rbd-draggable-id="externalBills" tabindex="0" role="button" aria-describedby="rbd-hidden-text-1-hidden-text-10" data-rbd-drag-handle-draggable-id="externalBills" data-rbd-drag-handle-context-id="1" draggable="false" style="margin-bottom: 10px; padding: 5px; border: 1px dashed rgb(217, 217, 217); background-color: rgb(249, 249, 249);">
            <h4>Các khoản phụ thu</h4>
            ${externalBillsHtml}
            <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
                <strong>Tổng phụ thu: ${totalExternalBill.toLocaleString()}đ</strong>
            </div>
        </div>
    `;

        const totalRegex = /<div data-rbd-draggable-context-id="\d+" data-rbd-draggable-id="total"/;
        template = template.replace(totalRegex, externalBillsSection + '$&');
    }

    template = template.replace(/<h4[^>]*>Tổng cộng:.*?<\/h4>/, `<h4 style="text-align: center;">Tổng cộng: ${data.liteBill_Total.toLocaleString()}đ</h4>`);

    return template;
}


export default fillInvoiceTemplate