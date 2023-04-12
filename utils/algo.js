const loopingSegregationLogic = async (data, total) => {
  let resultantData = data.filter((element, index) => {
    if (
      element?.paymentList.every(
        (element) => element?.paymentType === "cash"
      ) &&
      element?.saleProducts.length > 0
    ) {
      if (parseInt(element?.saleDiscount?.totalDiscount) == 0) {
        return true;
      } else if (
        parseFloat(
          element?.saleDiscount?.totalDiscount /
            parseFloat(element.invoiceTotal)
        ) <= 55
      ) {
        return true;
      }
    }
    return false;
  });

  if (resultantData.length < 1) return [];

  let singleData = resultantData; //.slice(4, 5) //.slice(5, 6) //[resultantData[1]] //[await resultantData.find(data => data.invoiceNo === "NPIPLS02084")];

  let productCostInfo = {};

  let totalAmountDeduction = 230;
  let totalAmountDeductionCalc = 230;
  let final = [];

  function getRandomArbitrary(min, max) {
    let randomNum = Math.floor(Math.random() * (max - min + 1) + min);
    return randomNum % 5 === 0 ? randomNum : roundToMultipleOf5(randomNum);
  }

  function roundToMultipleOf5(num) {
    return Math.round(num / 5) * 5;
  }

  // let invoiceData = singleData.reduce()

  let loopCount = 100;

  function tallyGenerated(subractedValue, n, result, maxValues, newArray) {
    // let loopCount = 100;
    let modulous =
      subractedValue % 5 === 0
        ? subractedValue
        : subractedValue - (subractedValue % 5);
    let division = n % 5 === 0 ? n : n < 5 ? 5 : n - (n % 5);
    if (modulous < 10 && modulous < division) {
      subractedValue = 0;
      return subractedValue;
    }
    let spreadValue =
      (modulous / division) % 5 === 0
        ? modulous / division
        : modulous / division - ((modulous / division) % 5);
    if (modulous / division < 5 && (modulous / division) % 5 !== 0) {
      spreadValue = 5;
    }
    // let newArray = []
    console.log(
      "Inside tallyGenerated",
      subractedValue,
      modulous,
      division,
      spreadValue
    );
    let carryforwardValue = 0;
    let someState = false;
    for (let i = 0; i < n; i++) {
      // loopCount--;
      // if (loopCount > 0) {
      //   break;
      // }
      if (subractedValue === 0 || subractedValue < 5) break;
      console.log(
        i,
        "Before ====> Index is -",
        i,
        "Result is -",
        result[i],
        "Spread Value is -",
        spreadValue,
        "Max Value is -",
        maxValues[i]
      );
      if (result[i] >= 0) {
        if (result[i] + newArray[i] + spreadValue <= maxValues[i]) {
          let someValue = maxValues[i] - spreadValue - result[i] - newArray[i];
          let addingValue = 0;
          if (carryforwardValue > 0) {
            addingValue =
              carryforwardValue === 0
                ? someValue
                : someValue >= 0 && carryforwardValue > 0
                ? carryforwardValue >= someValue
                  ? someValue
                  : carryforwardValue
                : someValue;
            carryforwardValue =
              carryforwardValue > 0
                ? carryforwardValue - addingValue
                : carryforwardValue;
          }
          console.log(i, "====>", someValue, addingValue, carryforwardValue);
          if (addingValue > 0) {
            newArray[i] = newArray[i] + addingValue + spreadValue;
            subractedValue = subractedValue - (addingValue + spreadValue);
          } else {
            newArray[i] = newArray[i] + spreadValue;
            subractedValue = subractedValue - spreadValue;
          }
        } else if (
          Math.abs(result[i] + newArray[i] - maxValues[i]) <= subractedValue &&
          subractedValue == 5
        ) {
          someState = true;
          break;
        } else {
          newArray[i] = newArray[i];
          carryforwardValue += spreadValue;
        }
      }
    }
    if (someState) {
      subractedValue = 0;
      return subractedValue;
    }
    if (carryforwardValue >= subractedValue && subractedValue > 5) {
      let newValue = n % 5 === 0 ? n : n < 5 ? 5 : n + (5 - (n % 5));
      subractedValue = tallyGenerated(
        subractedValue,
        newValue,
        result,
        maxValues,
        newArray
      );
      // subractedValue = subractedValue - valueToBeSubracted
    }
    console.log("newArray ===> ", newArray);

    return subractedValue;
  }

  function generateRandomMultiples(n, sum, maxValues) {
    let result = [];
    let currentSum = 0;
    let totalSumOfItems = maxValues.reduce((acc, curr) => {
      return acc + curr;
    }, 0);
    if (totalSumOfItems === sum) {
      return maxValues;
    } else if (totalSumOfItems < sum) {
      sum = totalSumOfItems;
    }
    for (let i = 0; i < n; i++) {
      let maxMultiple = Math.floor(maxValues[i] / 5) * 5;
      let randomMultiple =
        5 *
        Math.floor(
          Math.random() * (Math.min(sum - currentSum, maxMultiple) / 5)
        );
      result.push(randomMultiple);
      currentSum += randomMultiple;
    }
    if (currentSum !== sum) {
      let diff = sum - currentSum;
      let subractedValue = diff % 5 === 0 ? diff : diff - (diff % 5);
      console.log("Before ==>", subractedValue);
      let loop = 0;
      let newArray = [...maxValues.map((element) => 0)];
      while (subractedValue > 0) {
        subractedValue = tallyGenerated(
          subractedValue,
          n,
          [...result],
          [...maxValues],
          newArray
        );
        console.log("After ==>", subractedValue);
        loop++;
      }
      for (let i = 0; i < n; i++) {
        result[i] = result[i] + newArray[i];
      }
    }
    return result;
  }

  let resultantValue = singleData.reduce(
    (accumulator, currentValue) => {
      accumulator.invoiceNumbers.push(currentValue.invoiceNumber);
      accumulator.invoiceTotal.push(parseFloat(currentValue.invoiceTotal));

      let salesValue = [];

      let maxItemsdiscount = currentValue.saleProducts.map(
        (innerElement, index) => {
          let Onepercent = innerElement?.skuProduct?.finalPrice / 100;
          salesValue.push(100 * Onepercent);

          let percentage = 60 * Onepercent;
          let totalDifference = 55 * Onepercent;
          let deductable = 55 * Onepercent;
          // percentage > totalDifference ? totalDifference : percentage;
          console.log(
            "===>",
            innerElement?.skuProduct?.sku,
            innerElement?.skuProduct?.finalPrice,
            "100 percent",
            100 * Onepercent,
            "percentage",
            percentage,
            "totalDifference",
            totalDifference,
            "deductable",
            deductable % 5 === 0
              ? deductable / Onepercent
              : (deductable - (deductable % 5)) / Onepercent,
            "amount",
            deductable % 5 === 0 ? deductable : deductable - (deductable % 5)
          );
          return {
            amount: deductable,
            // deductable % 5 === 0 ? deductable : deductable - (deductable % 5),
            percent:
              // deductable % 5 === 0
              deductable / Onepercent,
            //: (deductable - (deductable % 5)) / Onepercent,
            oldDiscount: innerElement?.skuProduct?.discount,
            oldPrice: innerElement?.skuProduct?.finalPrice,
            gst: innerElement?.saleProductCalculation?.gstPercent,
          };
        }
      );
      accumulator.itemPrice.push(salesValue);
      accumulator.maxDiscountItems.push(
        maxItemsdiscount.map((element) => element.amount)
      );
      accumulator.maxDiscountItemsPercent.push(maxItemsdiscount);
      let invoiceSum = maxItemsdiscount.reduce((accumulator, current) => {
        return accumulator + current.amount;
      }, 0);
      accumulator.maxDiscountInvoice.push(invoiceSum);
      accumulator.maxDiscountInvoicePercent.push(
        (invoiceSum * 100) / parseFloat(currentValue.invoiceTotal)
      );
      return accumulator;
    },
    {
      invoiceNumbers: [],
      invoiceTotal: [],
      maxDiscountInvoice: [],
      maxDiscountInvoicePercent: [],
      maxDiscountItems: [],
      maxDiscountItemsPercent: [],
      itemPrice: [],
      gst: [],
    }
  );

  if (total == 0) {
    // return resultantValue

    let consolData = {};
    let maxDisc = 0;
    let existingDisc = 0;
    let consolidatedInvoiceValue = 0;
    resultantValue.invoiceNumbers.map((element, index) => {
      maxDisc += resultantValue?.maxDiscountInvoice[index];
      consolidatedInvoiceValue += resultantValue?.invoiceTotal[index];
      existingDisc += parseFloat(
        resultantData[index]?.saleDiscount.totalDiscount
      );
      // console.log("GST CHECK",inn.oldPrice,inn.amount,inn.gst,inn.gst/2,((inn.oldPrice - inn.amount) * (parseFloat(inn.gst) / 2)) / (100 + (parseFloat(inn.gst) / 2)))
      consolData[element] = {
        invoiceNumber: element,
        invoiceTotalOld: resultantValue?.invoiceTotal[index],
        maxInvoiceAmountDiscount: resultantValue?.maxDiscountInvoice[index],
        maxInvoiceAmountDiscountPercent:
          resultantValue?.maxDiscountInvoicePercent[index],
        itemDetails: resultantValue?.maxDiscountItemsPercent[index].map(
          (inn, index) => ({
            itemAmountOld: inn.oldPrice,
            itemDiscountOld: inn.oldDiscount,
            itemAmountNew:
              (inn.oldPrice * 100) / (100 + parseFloat(inn.gst)) -
              (inn.oldPrice * 100 * (inn.percent / 100)) /
                (100 + parseFloat(inn.gst)),
            // - ((inn.oldPrice - inn.amount) * parseFloat(inn.gst)) / (100 +  parseFloat(inn.gst)),
            itemDiscountNew:
              (inn.oldPrice * 100 * (inn.percent / 100)) /
              (100 + parseFloat(inn.gst)),
            //inn.amount,
            itemDiscountPercentNew: inn.percent,
            cgst:
              ((inn.oldPrice * 100) / (100 + parseFloat(inn.gst)) -
              ((inn.oldPrice * 100 * (inn.percent / 100)) /
                (100 + parseFloat(inn.gst)))) *
                (parseFloat(inn.gst) / (100 * 2)),
            sgst:
              ((inn.oldPrice * 100) / (100 + parseFloat(inn.gst)) -
              ((inn.oldPrice * 100 * (inn.percent / 100)) /
                (100 + parseFloat(inn.gst)))) *
                (parseFloat(inn.gst) / (100 * 2)),
            gst: parseFloat(inn.gst),
          })
        ),
      };
    });
    return {
      maxDiscountValue: maxDisc,
      consolidatedInvoiceValue: consolidatedInvoiceValue,
      existingDisc: existingDisc,
      resultantValue: consolData,
    };
  }

  let randomTotals = generateRandomMultiples(
    resultantValue.maxDiscountInvoice.length,
    total,
    resultantValue.maxDiscountInvoice
  );

  let resultantDatas = resultantValue.invoiceNumbers.map((element, index) => {
    let data = generateRandomMultiples(
      resultantValue?.maxDiscountItems[index]?.length,
      randomTotals[index],
      [...resultantValue?.maxDiscountItems[index]]
    );
    return data;
  });

  let percentagetobeUpdated = resultantValue.itemPrice.map((element, index) => {
    let data = element.map((innerElement, innerindex) => {
      if (resultantDatas[index][innerindex] === 0) return 0;
      let percentage = (resultantDatas[index][innerindex] * 100) / innerElement;
      let modPercentage = percentage % 5;
      if (modPercentage !== 0) {
        let maxValue = resultantValue.maxDiscountItems[index][innerindex];
        let add = percentage + (5 - modPercentage);
        if ((innerElement / 100) * add <= maxValue) {
          return add;
        } else {
          let subract = percentage - modPercentage;
          return subract;
        }
      } else {
        return percentage;
      }
      // return (resultantDatas[index][innerindex] * 100) / innerElement
    });
    return data;
  });

  let totalDeduction = resultantValue.itemPrice.map((element, index) => {
    let data = element.map((innerElement, innerindex) => {
      return innerElement * (percentagetobeUpdated[index][innerindex] / 100);
    });
    return data;
  });

  if (total > 0) {
    let consolData = {};
    let maxDisc = 0;
    let existingDisc = 0;
    let consolidatedInvoiceValue = 0;
    resultantValue.invoiceNumbers.map((element, index) => {
      maxDisc += resultantValue?.maxDiscountInvoice[index];
      consolidatedInvoiceValue += resultantValue?.invoiceTotal[index];
      existingDisc += parseFloat(
        resultantData[index]?.saleDiscount.totalDiscount
      );
      // console.log("GST CHECK",inn.oldPrice,percentagetobeUpdated[index][innindex],inn.gst,inn.gst/2,((inn.oldPrice -
      //   (inn.oldPrice * percentagetobeUpdated[index][innindex])) *
      //   (parseFloat(inn.gst) / 2)) / (100 + (parseFloat(inn.gst) / 2)))
      let itemDetails = resultantValue?.maxDiscountItemsPercent[index].map(
        (inn, innindex) => 
          {
            console.log("New Item Amount",(inn.oldPrice * 100) / (100 + parseFloat(inn.gst)) -
            //inn.oldPrice -
            (inn.oldPrice *
              100 *
              (percentagetobeUpdated[index][innindex] / 100)) /
              (100 + parseFloat(inn.gst)), parseFloat(inn.gst) )
              console.log("New CGST",(inn.oldPrice * 100) / (100 + parseFloat(inn.gst)) -
              ((inn.oldPrice *
                100 *
                (percentagetobeUpdated[index][innindex] / 100)) /
                (100 + parseFloat(inn.gst))) * 0.005, (parseFloat(inn.gst) * 0.005), parseFloat(inn.gst))
          return {
          itemAmountOld: inn.oldPrice,
          itemDiscountOld: inn.oldDiscount,
          itemAmountNew:
            (inn.oldPrice * 100) / (100 + parseFloat(inn.gst)) -
            //inn.oldPrice -
            (inn.oldPrice *
              100 *
              (percentagetobeUpdated[index][innindex] / 100)) /
              (100 + parseFloat(inn.gst)),
          itemDiscountNew:
            (inn.oldPrice *
              100 *
              (percentagetobeUpdated[index][innindex] / 100)) /
            (100 + parseFloat(inn.gst)),
          //(inn.oldPrice * percentagetobeUpdated[index][innindex]) / 100,
          itemDiscountPercentNew: percentagetobeUpdated[index][innindex],
          cgst:
            ((inn.oldPrice * 100) / (100 + parseFloat(inn.gst)) -
            //inn.oldPrice -
            ((inn.oldPrice *
              100 *
              (percentagetobeUpdated[index][innindex] / 100)) /
              (100 + parseFloat(inn.gst))) )*
              (parseFloat(inn.gst) / (100 * 2)),
          sgst:
            ((inn.oldPrice * 100) / (100 + parseFloat(inn.gst)) -
            //inn.oldPrice -
            ((inn.oldPrice *
              100 *
              (percentagetobeUpdated[index][innindex] / 100)) /
              (100 + parseFloat(inn.gst)))) *
              (parseFloat(inn.gst) / (100 * 2)),
          gst: parseFloat(inn.gst),
        }
      }
        
      
      );
      let maxDiscInv = itemDetails.reduce(
        (partialSum, a) => partialSum + a.itemDiscountNew,
        0
      );
      consolData[element] = {
        invoiceNumber: element,
        invoiceTotalOld: resultantValue?.invoiceTotal[index],
        maxInvoiceAmountDiscount: maxDiscInv,
        maxInvoiceAmountDiscountPercent:
          (maxDiscInv / resultantValue?.invoiceTotal[index]) * 100,
        itemDetails,
      };
    });
    return {
      maxDiscountValue: maxDisc,
      consolidatedInvoiceValue: consolidatedInvoiceValue,
      existingDisc: existingDisc,
      resultantValue: consolData,
      resultantDatas,
      percentagetobeUpdated,
      totalDeduction,
      randomTotals,
    };
  }

  return {
    resultantDatas,
    resultantValue,
    percentagetobeUpdated,
    resultantDataLength: resultantData.length,
    totalDeduction,
    randomTotals,
  };
};

export default loopingSegregationLogic;
