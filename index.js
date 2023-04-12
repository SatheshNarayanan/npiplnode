import Fastify from "fastify";
import dummyData from "./utils/data.js";
import loopingSegregationLogic from "./utils/algo.js";
import cors from "@fastify/cors";
const fastify = Fastify({
  logger: false,
});

await fastify.register(cors, {
  // put your options here
});

// fastify.get('/', (request, reply) => {
//     reply.send({ hello: 'world' })
// })

fastify.post("/", async (request, reply) => {
  reply.type("application/json").code(200);
  let total = 8000;
  let data = await loopingSegregationLogic(dummyData, total);
  return {
    data: data,
  };
});

fastify.get("/getStatus", async (request, reply) => {
  reply.type("application/json").code(200);
  let total = 8000;
  let data = [
    {
      description: "Total Invoice Amount",
      value: 122334.12,
      color: "red",
    },
    {
      description: "0 - 10%",
      value: 1123,
      color: "green",
    },
    {
      description: "10 - 20%",
      value: 2231,
      color: "orange",
    },
    {
      description: "20 - 30%",
      value: 1334,
      color: "yellow",
    },
    {
      description: "40 - 50%",
      value: 134,
      color: "blue",
    },
    {
      description: "50 - 60%",
      value: 1123,
      color: "purple",
    },
  ];
  return {
    data: data,
  };
});

fastify.post("/fetchOrders", async (request, reply) => {
  console.log(request.body);
  let requestBody = JSON.parse(request.body)

  var myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${requestBody.token}`);

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  console.log("requestOptions",requestOptions)

  let data = fetch(
    `http://68.183.93.166:8080/erp-api-0.0.1/erp-api/report/get/cash-sale?storeCode=${requestBody.storeCode}&fromDate=${requestBody.fromDate}&toDate=${requestBody.toDate}`,
    requestOptions
  )
    .then((response) => response.text())
    .then(async (result) => {
      console.log(result);
      data = JSON.parse(result);
      console.log(data);
      let newData = data.filter((element, index) => {
        if (
          element?.paymentList.every(
            (element) => element?.paymentType === "cash"
          ) &&
          element?.saleProducts.length > 0
        ) {
          return true;
          // if (parseInt(element?.saleDiscount?.totalDiscount) === 0) {
          //     return true
          // }
        }
        return false;
      });

      console.log("newData", newData.length);
      let formattedData = newData.map((element, index) => {
        if (index == 0) console.log("element", element.saleProducts[0]);
        let formattedOutput = {};
        formattedOutput["orderNo"] = element?.invoiceNumber;
        formattedOutput["discount"] =
          element?.saleDiscount.length > 0
            ? element?.saleDiscount[0]?.totalDiscount
            : 0;
        formattedOutput["actualPrice"] = "";
        formattedOutput["gstPercent"] = "";
        formattedOutput["gstActuals"] = "";
        formattedOutput["totalOrderAmount"] = element?.invoiceTotal;
        formattedOutput["customerCode"] = element?.customerCode;
        formattedOutput["customerName"] = element?.customerName;
        formattedOutput["items"] = element?.saleProducts.map(
          (itemList, index) => {
            if (itemList.length > 0) {
              return itemList.reduce((acc, items) => {
                if (!items.productReturned) {
                  acc.push({
                    sku: items?.skuProduct?.sku,
                    oldsku: items?.skuProduct?.oldSku,
                    discountPercent:
                      items?.saleProductCalculation?.totalDiscountPercent,
                    discountValue:
                      items?.saleProductCalculation?.totalDiscountValue,
                    actualPrice: items?.saleProductCalculation?.price,
                    gstPercent: items?.saleProductCalculation?.gstPercent,
                    gstAmount: items?.saleProductCalculation?.gstValue,
                    TotalAmount:
                      items?.skuProduct?.price + items?.skuProduct.gstValue,
                  });
                }
                return acc;
              }, []);
            }
          }
        );
        return formattedOutput;
      });

      let sumData = await loopingSegregationLogic(
        newData.map((element) => ({
          ...element,
          saleDiscount: element?.saleDiscount[0],
          saleProducts: element?.saleProducts[0],
        })),
        parseInt(requestBody.sum)
      );
      return {
        sumData: sumData,
        data: formattedData,
      };
    })
    .catch((error) => {
      console.log("error", error);
      data = [];
      return [];
    });

  return data;
});

fastify.get("/getOrders", async (request, reply) => {
  request.body;
  reply.type("application/json").code(200);
  let data = dummyData.filter((element, index) => {
    if (
      element?.paymentList.every((element) => element?.paymentType === "cash")
    ) {
      return true;
      // if (parseInt(element?.saleDiscount?.totalDiscount) === 0) {
      //     return true
      // }
    }
    return false;
  });
  let formattedData = data.map((element, index) => {
    let formattedOutput = {};
    formattedOutput["orderNo"] = element?.invoiceNo;
    formattedOutput["discount"] = element?.saleDiscount?.totalDiscount;
    formattedOutput["actualPrice"] = "";
    formattedOutput["gstPercent"] = "";
    formattedOutput["gstActuals"] = "";
    formattedOutput["totalOrderAmount"] = element?.total;
    formattedOutput["customerCode"] = element?.customer?.code;
    formattedOutput["items"] = element?.saleProducts.map((items, index) => {
      return {
        sku: items?.skuProduct?.sku,
        oldsku: items?.skuProduct?.oldSku,
        discountPercent: items?.saleProductCalculation?.totalDiscountPercent,
        discountValue: items?.saleProductCalculation?.totalDiscountValue,
        actualPrice: items?.saleProductCalculation?.price,
        gstPercent: items?.saleProductCalculation?.gstPercent,
        gstAmount: items?.saleProductCalculation?.gstValue,
        TotalAmount: items?.skuProduct?.finalPrice,
      };
    });
    return formattedOutput;
  });
  return {
    data: formattedData,
  };
});

// Run the server!
fastify.listen({ port: 3001 }, (err, address) => {
  if (err) throw err;
  // Server is now listening on ${address}
});
