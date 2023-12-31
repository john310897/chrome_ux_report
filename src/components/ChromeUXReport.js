import React, { useEffect, useState } from 'react';
import { Paper, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Container, Row, Col } from 'react-bootstrap';
import { getPageDefaults, getPageUXReport } from '../services/ChromeUXReportService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SelectBox from './SelectBox';

const ChromeUXReport = () => {
    const [urlList, setUrlList] = useState('');
    const [tableData, setTableData] = useState([]);
    const [toggelSort, setToggleSort] = useState(false)
    const [filters, setFilters] = useState({})
    const [tempList, setTempList] = useState([])
    const [pageDefaults, setPageDefaults] = useState({})

    useEffect(() => {
        getPageDefaultsForPage()
    }, [])
    const getPageDefaultsForPage = () => {
        getPageDefaults().then(resp => {
            setPageDefaults(resp?.data)
        })
    }

    // change function for filters
    const handleChange = (e) => {
        const { name, value } = e.target;
        filters[name] = value;
        setFilters({ ...filters })
        if (value)
            handleFilter()

    }

    // filter functionality for both fcp and lcp keys
    const handleFilter = () => {
        let dataList = tempList;
        dataList = dataList.filter(a => {
            const fcpP75 = a.metrics.first_contentful_paint?.percentiles?.p75;
            const lcpP75 = a.metrics.largest_contentful_paint?.percentiles?.p75;
            const fcpFilter = getMinAndMax(filters.fcp);
            const lcpFilter = getMinAndMax(filters.lcp);

            if ((filters?.fcp ?? false) && (filters.lcp ?? false)) {
                return (fcpP75 > fcpFilter.min && fcpP75 < fcpFilter.max) && (lcpP75 > lcpFilter.min && lcpP75 < lcpFilter.max);
            }
            if (filters?.fcp ?? false) {
                return (fcpP75 > fcpFilter.min && fcpP75 < fcpFilter.max);
            }
            if (filters?.lcp ?? false) {
                return (lcpP75 > lcpFilter.min && lcpP75 < lcpFilter.max);
            }
            return true
        })
        setTableData(dataList)
    }

    // getting min and max for the filters selected
    const getMinAndMax = (value) => {
        const operator = value?.charAt(0)
        value = parseInt(value?.slice(1))
        if (operator === '>') {
            return { min: value, max: Infinity }
        }
        if (operator === '<')
            return { min: 0, max: value }
    }

    // calling search to get the UX report with array of urls
    const handleSearch = () => {
        const urls = urlList.trim().split('\n');
        getPageUXReport(urls).then(resp => {
            setTableData(resp?.data)
            setTempList(resp?.data)
        }).catch(err => {
            toast.error("Please provide valid URLS/ Check your internet connectivity")
        })
    };

    // handling sort for FCP,LCP,CIS,FID
    const handleSort = (key) => {
        if (toggelSort === true) {
            tableData.sort((a, b) => b.metrics?.[key]?.percentiles?.p75 - a.metrics?.[key]?.percentiles?.p75)
        } else {
            tableData.sort((a, b) => a.metrics?.[key]?.percentiles?.p75 - b.metrics?.[key]?.percentiles?.p75)
        }
        setToggleSort(!toggelSort)
        setTableData([...tableData])
    }

    // sum functionality for FCP,LCP,CIS,FID
    const getSumOfDataSet = (dataObj) => {
        let sum = 0
        Object.values(pageDefaults?.metrix).forEach(field => {
            sum += parseFloat(dataObj?.metrics?.[field]?.percentiles?.p75)
        })
        return sum;
    }

    // average functionality for FCP,LCP,CIS,FID
    const getAvgOfDataSet = (dataObj) => {
        let avg = 0;
        let sum = getSumOfDataSet(dataObj)
        if (sum > 0)
            avg = (sum / Object?.values(pageDefaults?.metrix).length)
        return avg
    }

    return (

        <Container>
            <h5>CHROME UX REPORT</h5>
            <ToastContainer theme='colored' position='bottom-left' />
            <Paper>
                <Row style={{ alignItems: 'center' }}>
                    <Col lg='9'>
                        <TextField
                            multiline
                            rows={3}
                            fullWidth
                            label={pageDefaults?.search_container?.url_label}
                            placeholder={pageDefaults?.search_container?.placeholder}
                            variant="outlined"
                            value={urlList}
                            onChange={(e) => setUrlList(e.target.value)}
                        />
                    </Col>
                    <Col>
                        <Button size='large' variant="contained" color="primary" onClick={handleSearch}>
                            {pageDefaults?.search_container?.button_label}
                        </Button>
                    </Col>
                </Row>
                <br />
                <Row>
                    {pageDefaults?.filters?.map((filterObj, index) => (
                        <Col align='left' key={index}>
                            <SelectBox
                                name={filterObj?.name}
                                label={filterObj?.label}
                                value={filters?.[filterObj?.name] ?? 0}
                                onChange={handleChange}
                                options={filterObj?.options}
                            />
                        </Col>
                    ))}
                </Row>

                <br />
                {tableData?.length > 0 &&

                    <TableContainer component={Paper} str>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {pageDefaults?.table_headers?.map((header, index) => (
                                        <React.Fragment key={index + 1}>
                                            {Object.keys(pageDefaults.metrix).includes(header) ?
                                                <TableCell className='siteMetrix' onClick={() => handleSort(pageDefaults.metrix[header])}><b>{header}</b></TableCell>
                                                : <TableCell><b>{header}</b></TableCell>
                                            }
                                        </React.Fragment>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tableData.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{row?.key?.origin}</TableCell>
                                        <TableCell>{(row.collectionPeriod.firstDate?.day + '/' + row.collectionPeriod.firstDate?.month) + '-' + (row.collectionPeriod.lastDate?.day + '/' + row.collectionPeriod.lastDate?.month)}</TableCell>
                                        <TableCell>{row.metrics.first_contentful_paint?.percentiles?.p75}</TableCell>
                                        <TableCell>{row.metrics.largest_contentful_paint?.percentiles?.p75}</TableCell>
                                        <TableCell>{row.metrics.first_input_delay?.percentiles?.p75}</TableCell>
                                        <TableCell>{row.metrics.cumulative_layout_shift?.percentiles?.p75}</TableCell>
                                        <TableCell>{getSumOfDataSet(row)}</TableCell>
                                        <TableCell>{getAvgOfDataSet(row)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                }

            </Paper >
        </Container >
    );
};

export default ChromeUXReport;
