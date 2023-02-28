import React from 'react';
import Table from 'react-bootstrap/Table';


function CommitTable(props) {
    const {commits} = props;

    function simpleDate(stringDate) {
        const date = new Date(stringDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // add 1 because months are zero-indexed
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();

        return `${year}-${month}-${day} ${hour}:${minute}`;
    }

    return (
        <Table striped bordered hover>
            <thead>
            <tr>
                <th>Short ID</th>
                <th>Author Name</th>
                <th>Authored Date</th>
                <th>Message</th>
            </tr>
            </thead>
            <tbody>
            {commits.map((commit) => (
                <tr key={commit.id}>
                    <td>{commit.short_id}</td>
                    <td>{commit.author_name}</td>
                    <td>{simpleDate(commit.authored_date)}</td>
                    <td>{commit.message}</td>
                </tr>
            ))}
            </tbody>
        </Table>
    );
}

export default CommitTable;